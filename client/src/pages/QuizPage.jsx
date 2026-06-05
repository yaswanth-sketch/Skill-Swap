import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const QUIZ_DATA = {
  'Python': [
    { q: "What is the correct file extension for Python files?", a: [".py", ".python", ".pyt", ".pt"], correct: 0 },
    { q: "Which of these is used to define a block of code in Python?", a: ["Parentheses", "Indentation", "Curly braces", "Quotation marks"], correct: 1 },
    { q: "How do you create a variable with the numeric value 5?", a: ["x = 5", "x = int(5)", "Both are correct", "x : 5"], correct: 2 },
    { q: "Which keyword is used to create a function?", a: ["func", "define", "def", "function"], correct: 2 },
    { q: "What is the output of print(type([]) is list)?", a: ["True", "False", "Error", "None"], correct: 0 }
  ],
  'Web Development': [
    { q: "What does HTML stand for?", a: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Text Main Language"], correct: 0 },
    { q: "Which CSS property controls the text size?", a: ["font-style", "text-size", "font-size", "text-style"], correct: 2 },
    { q: "Inside which HTML element do we put the JavaScript?", a: ["<js>", "<scripting>", "<script>", "<javascript>"], correct: 2 },
    { q: "What is the correct HTML for referring to an external style sheet?", a: ["<style src='...'>", "<link rel='stylesheet' href='...'>", "<stylesheet>...</stylesheet>", "<css>...</css>"], correct: 1 },
    { q: "Which HTML attribute is used to define inline styles?", a: ["class", "styles", "font", "style"], correct: 3 }
  ],
  'Default': [
    { q: "What is the first step in learning a new skill?", a: ["Practice", "Theory", "Assessment", "Asking for help"], correct: 1 },
    { q: "Which level comes after Beginner?", a: ["Advanced", "Intermediate", "Expert", "Master"], correct: 1 },
    { q: "How many hours of practice make you an expert (typically)?", a: ["100", "1,000", "10,000", "100,000"], correct: 2 },
    { q: "What is a 'Soft Skill'?", a: ["Coding", "Mathematics", "Communication", "Physics"], correct: 2 },
    { q: "Consistency is key to mastery.", a: ["True", "False", "Maybe", "Depends"], correct: 0 }
  ]
};

export default function QuizPage() {
  const { topicName } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [assignedLevel, setAssignedLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const questions = QUIZ_DATA[topicName] || QUIZ_DATA['Default'];

  const handleAnswer = (index) => {
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitResults();
    }
  };

  const submitResults = async () => {
    setLoading(true);
    try {
      // Mock skill_id for now or find one matching the topic
      const res = await API.post('/quizzes/submit', {
        skill_id: 1, // Fallback skill_id
        score: score,
        total_questions: questions.length
      });
      setAssignedLevel(res.data.level);
      setShowResult(true);
    } catch (err) {
      console.error(err);
      setShowResult(true); // Show local result anyway
    } finally {
      setLoading(false);
    }
  };

  if (showResult) {
    const isMastered = (score / questions.length) >= 0.8;
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem' }}>
           <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{isMastered ? '✅' : '📝'}</div>
           <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
             {isMastered ? 'Assignment Passed!' : 'Assignment Complete!'}
           </h1>
           <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
             {isMastered 
               ? "Excellent! You have successfully completed the assignment for this concept." 
               : "You have completed the assignment. Review the lesson and try again to improve your score."}
           </p>
           
           <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Your Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'capitalize' }}>
                {Math.round((score/questions.length)*100)}%
              </div>
              <div style={{ marginTop: '1rem', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                 <div style={{ width: `${(score/questions.length)*100}%`, height: '100%', background: 'var(--accent-gradient)' }}></div>
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>Result: {score} out of {questions.length} Correct</p>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/topic/${topicName}/learn`)}>Back to Lessons</button>
              <button className="btn btn-secondary" onClick={() => navigate('/')}>Home</button>
           </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const progress = ((currentQuestion) / questions.length) * 100;

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>{topicName} Assignment</h2>
        <p style={{ color: '#94a3b8' }}>Test your understanding of the concept you just learned.</p>
      </div>

      <div className="glass-card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: `${progress}%`, height: '4px', background: 'var(--accent-gradient)', transition: 'width 0.3s ease' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '0.85rem', color: '#64748b' }}>
           <span>Question {currentQuestion + 1} of {questions.length}</span>
           <span>{Math.round(progress)}% Complete</span>
        </div>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem', lineHeight: 1.4 }}>{q.q}</h3>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {q.a.map((opt, i) => (
            <button 
              key={i} 
              className="glass-card-static" 
              onClick={() => handleAnswer(i)}
              style={{ 
                padding: '1.25rem 2rem', 
                textAlign: 'left', 
                fontSize: '1rem', 
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s ease',
                background: 'rgba(255,255,255,0.02)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {String.fromCharCode(65 + i)}
                 </div>
                 {opt}
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💡</div>
           <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Tip: Take your time. This assessment helps us customize your learning roadmap!</p>
        </div>
      </div>
    </div>
  );
}
