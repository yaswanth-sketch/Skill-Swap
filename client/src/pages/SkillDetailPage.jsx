import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import LearningRoadmap from '../components/LearningRoadmap';

export default function SkillDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    API.get(`/skills/${id}`).then(res => { setSkill(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;
  if (!skill) return <div className="page-container"><div className="empty-state"><h3>Skill not found</h3></div></div>;

  const isOwner = user?.user_id === skill.user_id;
  const levelColors = { beginner: 'badge-success', intermediate: 'badge-warning', advanced: 'badge-danger' };

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="glass-card-static fade-in" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className={`badge ${levelColors[skill.level]}`}>{skill.level}</span>
              {skill.category && <span className="badge badge-primary">{skill.category}</span>}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>{skill.title}</h1>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '1rem' }}>{skill.description}</p>
            {skill.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {skill.tags.map(tag => <span key={tag} className="badge badge-info">{tag}</span>)}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', minWidth: '140px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fbbf24' }}>⭐ {skill.avg_rating}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{skill.review_count} reviews</div>
            {!isOwner && (
              <button className="btn btn-primary mt-2" onClick={() => setShowBookModal(true)}>📅 Book Session</button>
            )}
          </div>
        </div>
        {/* Teacher Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }} onClick={() => navigate(`/profile/${skill.user_id}`)}>
          <div className="avatar">{skill.teacher_name?.charAt(0)}</div>
          <div>
            <div style={{ fontWeight: 600 }}>{skill.teacher_name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{skill.department} • {skill.teacher_bio?.substring(0, 60)}</div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={(e) => { e.stopPropagation(); navigate(`/chat?to=${skill.user_id}`); }}>💬 Message</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Lessons ({skill.lessons?.length || 0})</button>
        <button className={`tab ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>🎓 Roadmap</button>
        <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({skill.reviews?.length || 0})</button>
      </div>

      {/* Roadmap */}
      {activeTab === 'roadmap' && (
        <LearningRoadmap skillTitle={skill.title} />
      )}

      {/* Lessons */}
      {activeTab === 'overview' && (
        <div>
          {skill.lessons?.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📝</div><h3>No lessons yet</h3></div>
          ) : (
            skill.lessons?.map((lesson, i) => (
              <div key={lesson.lesson_id} className="glass-card fade-in" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#818cf8', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{lesson.title}</h4>
                  {lesson.content && <p style={{ fontSize: '0.85rem', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lesson.content}</p>}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>{Math.floor(lesson.duration_secs / 60)}m</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviews */}
      {activeTab === 'reviews' && (
        <div>
          {skill.reviews?.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">⭐</div><h3>No reviews yet</h3></div>
          ) : (
            skill.reviews?.map(review => (
              <div key={review.review_id} className="glass-card fade-in" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <div className="avatar avatar-sm">{review.reviewer_name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.reviewer_name}</div>
                    <div className="stars">{[1,2,3,4,5].map(n => <span key={n} className={`star ${n <= review.rating ? 'filled' : ''}`}>★</span>)}</div>
                  </div>
                </div>
                {review.comment && <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{review.comment}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Book Session Modal */}
      {showBookModal && <BookModal skill={skill} onClose={() => setShowBookModal(false)} />}
    </div>
  );
}

function BookModal({ skill, onClose }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/sessions/book', {
        skill_id: skill.skill_id,
        teacher_id: skill.user_id,
        scheduled_at: `${date} ${time}`,
        duration_mins: duration,
        notes
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Session Booked!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Waiting for {skill.teacher_name} to confirm.</p>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Book a Session</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>with <strong style={{ color: '#f1f5f9' }}>{skill.teacher_name}</strong> for <strong style={{ color: '#f1f5f9' }}>{skill.title}</strong></p>
        <form onSubmit={handleBook}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group"><label>Date *</label><input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div className="input-group"><label>Time *</label><input className="input-field" type="time" value={time} onChange={e => setTime(e.target.value)} required /></div>
          </div>
          <div className="input-group"><label>Duration (minutes)</label>
            <select className="input-field" value={duration} onChange={e => setDuration(parseInt(e.target.value))}>
              <option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option><option value={90}>90 min</option>
            </select>
          </div>
          <div className="input-group"><label>Notes</label><textarea className="input-field" placeholder="What do you want to focus on?" value={notes} onChange={e => setNotes(e.target.value)} /></div>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>{loading ? 'Booking...' : 'Confirm Booking'}</button>
        </form>
      </div>
    </div>
  );
}
