import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TopicsPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/topics').then(res => {
      setTopics(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const getPersonalizedTopics = () => {
    if (!topics.length) return [];
    
    // Sort topics by relevance to user profile
    const scored = [...topics].map(t => {
      let score = t.skill_count || 0;
      if (user) {
        // Boost if topic matches user's department
        if (user.department && t.tag_name.toLowerCase().includes(user.department.toLowerCase().split(' ')[0])) score += 50;
        // Boost if topic is in user's known skills
        if (user.skills_known && user.skills_known.toLowerCase().includes(t.tag_name.toLowerCase())) score += 100;
        // Boost based on year of study (optional logic)
      }
      return { ...t, score };
    }).sort((a, b) => b.score - a.score);

    if (search.trim()) {
      return scored.filter(t => t.tag_name.toLowerCase().includes(search.toLowerCase()));
    }
    
    return scored.slice(0, 10);
  };

  const displayTopics = getPersonalizedTopics();

  return (
    <>
      <div className="page-container" style={{ position: 'relative', zIndex: 10, paddingBottom: '5rem' }}>
        
        {/* User Dashboard Section */}
        {user && (
          <div className="glass-card fade-in" style={{ marginBottom: '3rem', padding: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="avatar avatar-xl" style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)', width: '70px', height: '70px', fontSize: '1.8rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Hello, {user.name.split(' ')[0]}! 👋
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.2rem' }}>
                  {user.department} • Year {user.year_of_study}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem' }}>🔥</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{user.current_streak || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Streak</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem' }}>✨</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{user.points || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Points</div>
              </div>
            </div>
          </div>
        )}

        <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="page-title" style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em' }}>What's Next?</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Search for any skill or browse your personalized top picks.</p>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: '800px', margin: '0 auto 4rem auto', position: 'relative' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1.5rem', 
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '50px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }} onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}>
            <span style={{ fontSize: '1.5rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search 100+ skills (e.g. React, Python, UI Design...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, padding: '1rem 0', fontSize: '1.2rem', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{search ? `Search Results for "${search}"` : '✨ Top Picks For You'}</h2>
              {!search && <span style={{ fontSize: '0.8rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>Tailored to your profile</span>}
            </div>

            {displayTopics.length === 0 ? (
              <div className="empty-state" style={{ padding: '5rem 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.2 }}>🔍</div>
                <h3 style={{ color: '#64748b' }}>We couldn't find "{search}"</h3>
                <p style={{ marginTop: '0.5rem' }}>Try searching for something else or browse categories.</p>
              </div>
            ) : (
              <div className="grid-3" style={{ gap: '1.5rem' }}>
                {displayTopics.map((topic) => (
                  <div 
                    key={topic.tag_id} 
                    className="glass-card-static fade-in" 
                    style={{ 
                      cursor: topic.is_locked ? 'not-allowed' : 'pointer', 
                      padding: '2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      background: topic.is_locked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease',
                      borderRadius: '24px',
                      opacity: topic.is_locked ? 0.6 : 1,
                      filter: topic.is_locked ? 'grayscale(100%)' : 'none'
                    }}
                    onClick={() => {
                      if (topic.is_locked) {
                        const confirmFastTrack = window.confirm(
                          `"${topic.tag_name}" is locked! \n\nDo you already know "${topic.prerequisite_name}"? \nClick OK to take the Fast Track Assignment. Pass with 75% to unlock this topic instantly!`
                        );
                        if (confirmFastTrack) {
                          navigate(`/topic/${encodeURIComponent(topic.prerequisite_name)}/quiz`);
                        }
                      } else {
                        navigate(`/topic/${encodeURIComponent(topic.tag_name)}`);
                      }
                    }}
                    onMouseEnter={(e) => { 
                      if (!topic.is_locked) {
                        e.currentTarget.style.transform = 'translateY(-5px)'; 
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.transform = 'none'; 
                      e.currentTarget.style.background = topic.is_locked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', position: 'relative' }}>
                      {topic.tag_name.charAt(0)}
                      {topic.is_locked && (
                        <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#ef4444', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', border: '2px solid var(--bg-primary)' }}>
                          🔒
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>{topic.tag_name}</h3>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {topic.is_locked ? (
                          <span style={{ color: '#ef4444' }}>Requires: {topic.prerequisite_name}</span>
                        ) : (
                          `${topic.skill_count} ${topic.skill_count === 1 ? 'Mentor' : 'Mentors'}`
                        )}
                      </div>
                    </div>
                    {!topic.is_locked && <div style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}>→</div>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
