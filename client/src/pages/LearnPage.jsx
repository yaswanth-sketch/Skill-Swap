import { useState, useEffect } from 'react';
import API from '../services/api';

export default function LearnPage() {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/lessons/learn'),
      API.get('/lessons/progress')
    ]).then(([skillsRes, progressRes]) => {
      setSkills(skillsRes.data);
      setProgress(progressRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadLessons = async (skillId) => {
    const res = await API.get(`/lessons?skill_id=${skillId}`);
    setLessons(res.data);
    setSelectedSkill(skillId);
  };

  const completeLesson = async (lessonId) => {
    await API.post(`/lessons/${lessonId}/complete`);
    setProgress(prev => [...prev, { lesson_id: lessonId, completed: true }]);
    // Update skill counts
    setSkills(prev => prev.map(s => {
      if (s.skill_id === selectedSkill) {
        return { ...s, completed_lessons: s.completed_lessons + 1 };
      }
      return s;
    }));
  };

  const isCompleted = (lessonId) => progress.some(p => p.lesson_id === lessonId && p.completed);

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Micro-Learning</h1>
        <p className="page-subtitle">Bite-sized lessons from campus experts</p>
      </div>

      {!selectedSkill ? (
        /* Skill List */
        <div className="grid-2">
          {skills.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">📚</div>
              <h3>No lessons available yet</h3>
              <p>Check back later or create micro-lessons for your skills!</p>
            </div>
          ) : (
            skills.map(skill => {
              const pct = skill.total_lessons > 0 ? Math.round((skill.completed_lessons / skill.total_lessons) * 100) : 0;
              return (
                <div key={skill.skill_id} className="glass-card fade-in" style={{ cursor: 'pointer' }} onClick={() => loadLessons(skill.skill_id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>{skill.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>by {skill.teacher_name} • {skill.level}</p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pct === 100 ? '#10b981' : '#818cf8' }}>{pct}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>{skill.completed_lessons}/{skill.total_lessons} lessons</span>
                    <span>{skill.category}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Lesson View */
        <div>
          <button className="btn btn-secondary mb-2" onClick={() => setSelectedSkill(null)}>
            ← Back to courses
          </button>
          {lessons.map((lesson, i) => {
            const done = isCompleted(lesson.lesson_id);
            return (
              <div key={lesson.lesson_id} className="glass-card-static fade-in" style={{ marginBottom: '0.75rem', border: done ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem',
                    background: done ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                    color: done ? '#10b981' : '#818cf8'
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: done ? '#10b981' : '#f1f5f9' }}>{lesson.title}</h4>
                    {lesson.content && (
                      <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>{lesson.content}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>⏱️ {Math.floor(lesson.duration_secs / 60)} min read</span>
                      {!done && (
                        <button className="btn btn-success btn-sm" onClick={() => completeLesson(lesson.lesson_id)}>
                          ✓ Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
