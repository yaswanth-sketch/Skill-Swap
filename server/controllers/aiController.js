const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.getAIChatResponse = async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required to talk to the AI.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // --- SMART CONTEXT INJECTION ---
    // Fetch some real data to make the AI smarter
    const db = require('../config/db');
    
    // 1. Fetch top teachers
    const [topTeachers] = await db.query(`
      SELECT u.user_id, u.name, u.points, COALESCE(AVG(r.rating), 0) as rating
      FROM users u
      LEFT JOIN reviews r ON u.reviewee_id = u.user_id
      GROUP BY u.user_id
      ORDER BY u.points DESC, rating DESC
      LIMIT 5
    `);

    // 2. Fetch popular skills
    const [popularSkills] = await db.query(`
      SELECT title, category, COUNT(*) as count
      FROM skills
      GROUP BY title, category
      ORDER BY count DESC
      LIMIT 10
    `);

    const systemPrompt = `You are the "Campus Prodigy AI", the primary assistant for the Campus Skill Exchange platform. 
Your goal is to help students learn faster by recommending the best mentors and creating smart roadmaps.

REAL PLATFORM DATA FOR YOU TO USE:
- Top Rated Mentors: ${topTeachers.map(t => `${t.name} (Rating: ${parseFloat(t.rating).toFixed(1)})`).join(', ')}
- Trending Skills: ${popularSkills.map(s => s.title).join(', ')}

YOUR KILLER FEATURES:
1. Suggest Skills: If a user is bored or wants to grow, suggest trending skills from the list above.
2. Recommend Teachers: If a user asks for a specific skill, mention that they can find mentors like the ones listed above in the "Skills" section.
3. Roadmap: For any skill, provide a high-quality 4-step beginner roadmap.
4. Auto-Reply: Answer basic platform questions (how to book, how to chat).

CRITICAL FORMATTING:
- Use ONLY pure HTML tags (<h3>, <b>, <ul>, <li>, <p>, <br>). No markdown!
- Use lots of emojis! 🚀🔥🎓
- Make it look premium and encouraging.
- If you mention a teacher, wrap their name in <b>.

User Query: ${message}`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    res.json({ reply: text });

  } catch (err) {
    console.error('AI Error:', err);
    next(err);
  }
};
