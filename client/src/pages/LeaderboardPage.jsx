import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/users/leaderboard').then(res => { 
      setLeaders(res.data); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;

  const topThree = leaders.slice(0, 3);
  const others = leaders.slice(3);

  return (
    <div className="page-container" style={{ paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Campus Superstars
        </h1>
        <p className="page-subtitle">Celebrating our top mentors and learners</p>
      </div>

      {/* Podium Section */}
      {topThree.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '4rem', padding: '0 1rem', flexWrap: 'wrap' }}>
          {/* 2nd Place */}
          {topThree[1] && (
            <div onClick={() => navigate(`/profile/${topThree[1].user_id}`)} style={{ textAlign: 'center', cursor: 'pointer', flex: 1, maxWidth: '200px' }}>
              <div className="fade-in" style={{ 
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '24px 24px 0 0', padding: '1.5rem 1rem 2rem', position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '2.5rem' }}>🥈</div>
                <div className="avatar avatar-lg" style={{ margin: '0 auto 1rem', width: '80px', height: '80px', border: '3px solid #94a3b8' }}>{topThree[1].name?.charAt(0)}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{topThree[1].name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>{topThree[1].department}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '0.75rem' }}>
                  {topThree[1].badges?.map((b, i) => <span key={i} title={b}>{b}</span>)}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#94a3b8' }}>{topThree[1].points} pts</div>
              </div>
              <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '0 0 12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)' }}>2</div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div onClick={() => navigate(`/profile/${topThree[0].user_id}`)} style={{ textAlign: 'center', cursor: 'pointer', flex: 1, maxWidth: '240px' }}>
              <div className="fade-in" style={{ 
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.15))', 
                border: '2px solid rgba(139, 92, 246, 0.3)', 
                borderRadius: '24px 24px 0 0', padding: '2rem 1rem 3rem', position: 'relative',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)'
              }}>
                <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '3.5rem' }}>🥇</div>
                <div className="avatar avatar-lg" style={{ margin: '0 auto 1rem', width: '100px', height: '100px', border: '4px solid #fbbf24', boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}>{topThree[0].name?.charAt(0)}</div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.25rem' }}>{topThree[0].name}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>{topThree[0].department}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  {topThree[0].badges?.map((b, i) => <span key={i} title={b}>{b}</span>)}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 950, color: '#fbbf24', letterSpacing: '-0.02em' }}>{topThree[0].points} pts</div>
              </div>
              <div style={{ height: '150px', background: 'rgba(255,255,255,0.08)', borderRadius: '0 0 12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.15)' }}>1</div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div onClick={() => navigate(`/profile/${topThree[2].user_id}`)} style={{ textAlign: 'center', cursor: 'pointer', flex: 1, maxWidth: '200px' }}>
              <div className="fade-in" style={{ 
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '24px 24px 0 0', padding: '1.25rem 1rem 1.5rem', position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '2.5rem' }}>🥉</div>
                <div className="avatar avatar-lg" style={{ margin: '0 auto 1rem', width: '70px', height: '70px', border: '3px solid #b45309' }}>{topThree[2].name?.charAt(0)}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>{topThree[2].name}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>{topThree[2].department}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                  {topThree[2].badges?.map((b, i) => <span key={i} title={b}>{b}</span>)}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b45309' }}>{topThree[2].points} pts</div>
              </div>
              <div style={{ height: '70px', background: 'rgba(255,255,255,0.04)', borderRadius: '0 0 12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)' }}>3</div>
            </div>
          )}
        </div>
      )}

      {/* Detailed List */}
      <div className="glass-card-static" style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📊</span> All Rankings
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaders.map((leader, i) => (
            <div key={leader.user_id} onClick={() => navigate(`/profile/${leader.user_id}`)} className="fade-in"
              style={{
                display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.25rem', borderRadius: '16px',
                background: i < 3 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i < 3 ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.background = i < 3 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)';
              }}
            >
              <div style={{ width: '40px', fontWeight: 900, fontSize: '1.1rem', color: i < 3 ? '#fbbf24' : '#64748b', textAlign: 'center' }}>
                {i + 1}
              </div>
              
              <div style={{ position: 'relative' }}>
                <div className="avatar" style={{ width: '48px', height: '48px' }}>{leader.name?.charAt(0)}</div>
                {leader.max_streak >= 3 && <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '1rem' }}>🔥</div>}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{leader.name}</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {leader.badges?.slice(0, 3).map((b, j) => <span key={j} style={{ fontSize: '0.8rem' }}>{b}</span>)}
                  </div>
                </div>
                <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ flex: 1, maxWidth: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (leader.points / 1000) * 100)}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }}></div>
                   </div>
                   <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Level {Math.floor(leader.points / 100) + 1}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{leader.points}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points</div>
              </div>

              <div className="hide-mobile" style={{ textAlign: 'center', minWidth: '80px', padding: '0.25rem 0.75rem', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.9rem' }}>⭐ {leader.avg_rating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
