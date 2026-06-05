import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import CalendarView from '../components/CalendarView';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedSession, setSelectedSession] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    API.get('/sessions/my').then(res => { setSessions(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/sessions/${id}/status`, { status });
      setSessions(prev => prev.map(s => s.session_id === id ? { ...s, status } : s));
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  const filtered = sessions.filter(s => {
    if (filter === 'teaching') return s.teacher_id === user.user_id;
    if (filter === 'learning') return s.learner_id === user.user_id;
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'confirmed') return s.status === 'confirmed';
    if (filter === 'completed') return s.status === 'completed';
    return true;
  });

  const statusStyles = {
    pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: '⏳' },
    confirmed: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', icon: '✅' },
    completed: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: '🎉' },
    cancelled: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', icon: '❌' },
  };

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">My Sessions</h1>
          <p className="page-subtitle">Manage your teaching and learning sessions</p>
        </div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`tab ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>📋 List</button>
          <button className={`tab ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>📅 Calendar</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', val: sessions.length, icon: '📊' },
          { label: 'Teaching', val: sessions.filter(s => s.teacher_id === user.user_id).length, icon: '🎓' },
          { label: 'Learning', val: sessions.filter(s => s.learner_id === user.user_id).length, icon: '📖' },
          { label: 'Completed', val: sessions.filter(s => s.status === 'completed').length, icon: '✅' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
            <div className="stat-value">{stat.val}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filters */}
          <div className="tabs">
            {['all', 'teaching', 'learning', 'pending', 'confirmed', 'completed'].map(f => (
              <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Sessions List */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No sessions found</h3>
              <p>Book a session from the skill feed to get started!</p>
            </div>
          ) : (
            filtered.map(session => {
              const st = statusStyles[session.status];
              const isTeacher = session.teacher_id === user.user_id;
              return (
                <div key={session.session_id} className="glass-card fade-in" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: st.bg, color: st.color }}>
                          {st.icon} {session.status}
                        </span>
                        <span className="badge badge-primary">{isTeacher ? '🎓 Teaching' : '📖 Learning'}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.375rem' }}>{session.skill_title}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {isTeacher ? `Student: ${session.learner_name}` : `Teacher: ${session.teacher_name}`}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                        📅 {new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        &nbsp;•&nbsp; ⏱️ {session.duration_mins}min
                      </div>
                      {session.notes && <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.375rem', fontStyle: 'italic' }}>"{session.notes}"</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {isTeacher && session.status === 'pending' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(session.session_id, 'confirmed')}>Accept</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(session.session_id, 'cancelled')}>Decline</button>
                        </>
                      )}
                      {isTeacher && session.status === 'confirmed' && (
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(session.session_id, 'completed')}>Mark Complete</button>
                      )}
                      {!isTeacher && session.status === 'pending' && (
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(session.session_id, 'cancelled')}>Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </>
      ) : (
        <CalendarView 
          events={sessions} 
          onEventClick={(s) => setSelectedSession(s)}
        />
      )}

      {selectedSession && (
        <SessionDetailsModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
          onUpdate={updateStatus}
          user={user}
          statusStyles={statusStyles}
        />
      )}
    </div>
  );
}

function SessionDetailsModal({ session, onClose, onUpdate, user, statusStyles }) {
  const isTeacher = session.teacher_id === user.user_id;
  const st = statusStyles[session.status];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Session Details</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: st.bg, color: st.color }}>
              {st.icon} {session.status}
            </span>
            <span className="badge badge-primary">{isTeacher ? '🎓 Teaching' : '📖 Learning'}</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{session.skill_title}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {isTeacher ? `Student: ${session.learner_name}` : `Teacher: ${session.teacher_name}`}
          </p>
        </div>

        <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>SCHEDULED FOR</div>
          <div style={{ fontWeight: 600 }}>
            📅 {new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
            ⏰ {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration_mins} min)
          </div>
        </div>

        {session.notes && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>NOTES</div>
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#94a3b8' }}>"{session.notes}"</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          {isTeacher && session.status === 'pending' && (
            <>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={() => { onUpdate(session.session_id, 'confirmed'); onClose(); }}>Accept</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { onUpdate(session.session_id, 'cancelled'); onClose(); }}>Decline</button>
            </>
          )}
          {isTeacher && session.status === 'confirmed' && (
            <button className="btn btn-success" style={{ flex: 1 }} onClick={() => { onUpdate(session.session_id, 'completed'); onClose(); }}>Mark Complete</button>
          )}
          {!isTeacher && session.status === 'pending' && (
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { onUpdate(session.session_id, 'cancelled'); onClose(); }}>Cancel Booking</button>
          )}
          <button className="btn btn-secondary" style={{ flex: isTeacher && session.status !== 'completed' ? 0 : 1 }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
