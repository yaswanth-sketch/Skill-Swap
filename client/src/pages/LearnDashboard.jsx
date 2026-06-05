import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Certificate from '../components/Certificate';

export default function LearnDashboard() {
  const { topicName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get(`/topics/${encodeURIComponent(topicName)}/lessons`),
      API.get(`/topics/${encodeURIComponent(topicName)}/teachers`)
    ]).then(([lessonsRes, teachersRes]) => {
      setLessons(lessonsRes.data);
      setTeachers(teachersRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [topicName]);

  const completedCount = lessons.filter(l => l.user_completed).length;
  const isCompleted = lessons.length > 0 && completedCount === lessons.length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (showCertificate) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <button className="btn btn-secondary" onClick={() => setShowCertificate(false)} style={{ marginBottom: '2rem' }}>← Back to Dashboard</button>
        <Certificate user={user} skillTitle={topicName} date={new Date().toLocaleDateString()} />
        <div style={{ marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Certificate</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/topic/${encodeURIComponent(topicName)}`)} style={{ marginBottom: '1rem' }}>
            ← Back
          </button>
          <h1 className="page-title">Learning {topicName}</h1>
          <p className="page-subtitle">Watch video lessons or book a live tutor</p>
        </div>
        
        {lessons.length > 0 && (
          <div style={{ textAlign: 'right', minWidth: '200px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
               <span>Course Progress</span>
               <span>{progressPercent}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
               <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-gradient)', transition: 'width 0.5s ease' }} />
            </div>
            {isCompleted && (
              <button className="btn btn-primary fade-in" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: 'none', color: '#000', fontWeight: 800 }} onClick={() => setShowCertificate(true)}>
                🎓 Claim Certificate
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Video Lessons</h2>
          {lessons.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">📹</div>
              <h3>No videos available yet</h3>
            </div>
          ) : (
            <div className="grid-3" style={{ marginBottom: '3rem' }}>
              {lessons.map(lesson => (
                  <div 
                    key={lesson.lesson_id} 
                    className="glass-card fade-in" 
                    style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    onClick={() => navigate(`/video/${lesson.lesson_id}`)}
                  >
                    <div style={{ width: '100%', height: '180px', background: getThumbnail(), position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3rem', opacity: 0.5 }}>▶</span>
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {Math.floor(lesson.duration_secs / 60)}:{String(lesson.duration_secs % 60).padStart(2, '0')}
                      </div>
                    </div>
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {lesson.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="avatar avatar-sm">{lesson.teacher_name?.charAt(0)}</div>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{lesson.teacher_name}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>👁 {lesson.views || 0} views</span>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Available Tutors</h2>
          {teachers.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <h3>No tutors available yet</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {teachers.map(teacher => (
                <div key={teacher.skill_id} className="glass-card static" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar">{teacher.teacher_name?.charAt(0)}</div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{teacher.teacher_name}</h4>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{teacher.title} • ⭐ {teacher.avg_rating}</div>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate(`/skill/${teacher.skill_id}`)}>
                    Book Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
