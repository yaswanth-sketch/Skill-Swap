const db = require('../config/db');

// Get all skills with filters
exports.getSkills = async (req, res, next) => {
  try {
    const { category, level, search, tag, user_id } = req.query;
    let query = `
      SELECT s.*, u.name as teacher_name, u.department, u.profile_pic,
             GROUP_CONCAT(DISTINCT t.tag_name) as tags,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.review_id) as review_count
      FROM skills s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN skill_tags st ON s.skill_id = st.skill_id
      LEFT JOIN tags t ON st.tag_id = t.tag_id
      LEFT JOIN sessions ses ON s.skill_id = ses.skill_id
      LEFT JOIN reviews r ON ses.session_id = r.session_id
      WHERE 1=1
    `;
    const params = [];

    if (category) { query += ' AND s.category = ?'; params.push(category); }
    if (level) { query += ' AND s.level = ?'; params.push(level); }
    if (user_id) { query += ' AND s.user_id = ?'; params.push(user_id); }
    if (search) { query += ' AND (s.title LIKE ? OR s.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (tag) { query += ' AND t.tag_name = ?'; params.push(tag); }

    query += ' GROUP BY s.skill_id ORDER BY s.created_at DESC';

    const [skills] = await db.query(query, params);
    
    // Parse tags string into array
    skills.forEach(s => {
      s.tags = s.tags ? s.tags.split(',') : [];
      s.avg_rating = parseFloat(s.avg_rating).toFixed(1);
    });

    res.json(skills);
  } catch (err) {
    next(err);
  }
};

// Get single skill by ID
exports.getSkill = async (req, res, next) => {
  try {
    const [skills] = await db.query(`
      SELECT s.*, u.name as teacher_name, u.department, u.bio as teacher_bio, u.profile_pic,
             GROUP_CONCAT(DISTINCT t.tag_name) as tags,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.review_id) as review_count
      FROM skills s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN skill_tags st ON s.skill_id = st.skill_id
      LEFT JOIN tags t ON st.tag_id = t.tag_id
      LEFT JOIN sessions ses ON s.skill_id = ses.skill_id
      LEFT JOIN reviews r ON ses.session_id = r.session_id
      WHERE s.skill_id = ?
      GROUP BY s.skill_id
    `, [req.params.id]);

    if (skills.length === 0) {
      return res.status(404).json({ error: 'Skill not found.' });
    }

    const skill = skills[0];
    skill.tags = skill.tags ? skill.tags.split(',') : [];
    skill.avg_rating = parseFloat(skill.avg_rating).toFixed(1);

    // Get lessons for this skill
    const [lessons] = await db.query(
      'SELECT * FROM micro_lessons WHERE skill_id = ? ORDER BY order_num',
      [req.params.id]
    );
    skill.lessons = lessons;

    // Get reviews for this skill's sessions
    const [reviews] = await db.query(`
      SELECT r.*, u.name as reviewer_name, u.profile_pic as reviewer_pic
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.user_id
      JOIN sessions ses ON r.session_id = ses.session_id
      WHERE ses.skill_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    skill.reviews = reviews;

    res.json(skill);
  } catch (err) {
    next(err);
  }
};

// Create skill
exports.createSkill = async (req, res, next) => {
  try {
    const { title, description, category, level, tags } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const [result] = await db.query(
      'INSERT INTO skills (user_id, title, description, category, level) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, title, description || null, category || null, level || 'beginner']
    );

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Insert tag if not exists
        await db.query('INSERT IGNORE INTO tags (tag_name) VALUES (?)', [tagName]);
        const [tagRows] = await db.query('SELECT tag_id FROM tags WHERE tag_name = ?', [tagName]);
        if (tagRows.length > 0) {
          await db.query('INSERT IGNORE INTO skill_tags (skill_id, tag_id) VALUES (?, ?)', [result.insertId, tagRows[0].tag_id]);
        }
      }
    }

    res.status(201).json({ message: 'Skill created', skill_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Update skill
exports.updateSkill = async (req, res, next) => {
  try {
    const { title, description, category, level } = req.body;
    
    // Check ownership
    const [skills] = await db.query('SELECT user_id FROM skills WHERE skill_id = ?', [req.params.id]);
    if (skills.length === 0) return res.status(404).json({ error: 'Skill not found.' });
    if (skills[0].user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await db.query(
      'UPDATE skills SET title = COALESCE(?, title), description = COALESCE(?, description), category = COALESCE(?, category), level = COALESCE(?, level) WHERE skill_id = ?',
      [title, description, category, level, req.params.id]
    );

    res.json({ message: 'Skill updated' });
  } catch (err) {
    next(err);
  }
};

// Delete skill
exports.deleteSkill = async (req, res, next) => {
  try {
    const [skills] = await db.query('SELECT user_id FROM skills WHERE skill_id = ?', [req.params.id]);
    if (skills.length === 0) return res.status(404).json({ error: 'Skill not found.' });
    if (skills[0].user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await db.query('DELETE FROM skills WHERE skill_id = ?', [req.params.id]);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    next(err);
  }
};

// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT category FROM skills WHERE category IS NOT NULL ORDER BY category');
    res.json(rows.map(r => r.category));
  } catch (err) {
    next(err);
  }
};

// Get all tags
exports.getTags = async (req, res, next) => {
  try {
    const [tags] = await db.query('SELECT * FROM tags ORDER BY tag_name');
    res.json(tags);
  } catch (err) {
    next(err);
  }
};
