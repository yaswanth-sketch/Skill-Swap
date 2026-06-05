import { useState, useEffect } from 'react';
import API from '../services/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    Promise.all([
      API.get('/admin/stats'),
      API.get('/admin/users'),
      API.get('/complaints')
    ]).then(([statsRes, usersRes, complaintsRes]) => {
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setComplaints(complaintsRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateRole = async (userId, role) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role } : u));
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete all their data.')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const updateComplaintStatus = async (id, status) => {
    try {
      await API.put(`/complaints/${id}`, { status });
      setComplaints(prev => prev.map(c => c.complaint_id === id ? { ...c, status } : c));
    } catch (err) {}
  };

  const deleteComplaint = async (id) => {
    try {
      await API.delete(`/complaints/${id}`);
      setComplaints(prev => prev.filter(c => c.complaint_id !== id));
    } catch (err) {}
  };

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⚙️ Admin Dashboard</h1>
        <p className="page-subtitle">Manage your platform</p>
      </div>

      <div className="tabs" style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '16px', display: 'inline-flex' }}>
        <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} style={{ borderRadius: '12px' }}>Overview</button>
        <button className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} style={{ borderRadius: '12px' }}>Analytics</button>
        <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')} style={{ borderRadius: '12px' }}>User Management</button>
        <button className={`tab ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')} style={{ borderRadius: '12px' }}>Moderation</button>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="fade-in">
          <div className="grid-3" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
            {[
              { label: 'Total Community', val: stats.counts.users, icon: '👥', trend: '+12%', color: 'var(--accent-primary)' },
              { label: 'Active Skills', val: stats.counts.skills, icon: '🎯', trend: '+5%', color: '#06b6d4' },
              { label: 'Successful Sessions', val: stats.counts.sessions, icon: '🤝', trend: '+24%', color: '#10b981' },
            ].map(stat => (
              <div key={stat.label} className="glass-card-static" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                   <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                   <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '8px', alignSelf: 'flex-start' }}>{stat.trend}</div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stat.val}</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: stat.color, opacity: 0.3 }} />
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
            <div className="glass-card-static" style={{ padding: '2rem' }}>
               <h3 style={{ marginBottom: '2rem', fontWeight: 800 }}>📈 Session Growth</h3>
               <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '5%', minWidth: '0' }}>
                  {stats.sessionsByMonth?.map((m, i) => {
                    const max = Math.max(...stats.sessionsByMonth.map(x => x.count), 1);
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', minWidth: '0' }}>
                        <div style={{ width: '100%', height: `${(m.count / max) * 100}%`, background: 'var(--accent-gradient)', borderRadius: '6px', minHeight: '4px' }} />
                        <span style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap' }}>{m.month.slice(0, 3)}</span>
                      </div>
                    )
                  })}
               </div>
            </div>

            <div className="glass-card-static" style={{ padding: '2rem' }}>
               <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>🔥 Hot Skills</h3>
               {stats.popularSkills?.slice(0, 5).map((skill, i) => (
                 <div key={i} style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                       <span>{skill.title}</span>
                       <span>{skill.count}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                       <div style={{ height: '100%', width: `${(skill.count / (stats.popularSkills[0]?.count || 1)) * 100}%`, background: 'var(--accent-primary)', borderRadius: '3px' }} />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="glass-card-static" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🆕 Recent Users</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Name', 'Email', 'Department', 'Role', 'Joined'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map(u => (
                    <tr key={u.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="avatar avatar-sm">{u.name?.charAt(0)}</div> {u.name}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>{u.department || '—'}</td>
                      <td style={{ padding: '0.75rem' }}><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>{u.role}</span></td>
                      <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && stats && (
        <div className="fade-in">
          <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="glass-card-static" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '2rem', fontWeight: 800 }}>🎯 Top Skills Mastery</h3>
              {stats.popularSkills?.map((skill, i) => {
                 const max = stats.popularSkills[0].count;
                 const pct = Math.round((skill.count / max) * 100);
                 return (
                   <div key={i} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                         <span style={{ fontWeight: 600 }}>{skill.title}</span>
                         <span style={{ color: '#64748b' }}>{skill.count} Students</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                         <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, var(--accent-primary), hsl(${250 + (i * 20)}, 70%, 60%))`, borderRadius: '4px' }} />
                      </div>
                   </div>
                 )
              })}
            </div>

            <div className="glass-card-static" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '2rem', fontWeight: 800 }}>🏆 Most Active Students</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stats.mostActiveUsers?.map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i < 3 ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.department}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{u.points}</div>
                      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#64748b' }}>Points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
             <div className="glass-card-static" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '2rem', fontWeight: 800 }}>📊 User Distribution</h3>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                   <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'conic-gradient(var(--accent-primary) 0% 30%, #06b6d4 30% 60%, #10b981 60% 100%)', position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: '25px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>{stats.counts.users}</div>
                   </div>
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {stats.topCategories.map((cat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                           <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: `hsl(${250 + (i * 40)}, 70%, 60%)` }} />
                           <span style={{ flex: 1 }}>{cat.category}</span>
                           <span style={{ fontWeight: 700 }}>{cat.count}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="glass-card-static" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '2rem', fontWeight: 800 }}>📈 Growth Velocity</h3>
                <svg viewBox="0 0 400 150" style={{ width: '100%', height: '150px', overflow: 'visible' }}>
                  <path 
                    d={`M ${stats.userGrowth?.map((g, i) => `${(i * 400) / (stats.userGrowth.length - 1 || 1)},${150 - (g.count * 15)}`).join(' L ')}`}
                    fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  />
                  {stats.userGrowth?.map((g, i) => (
                    <circle key={i} cx={(i * 400) / (stats.userGrowth.length - 1 || 1)} cy={150 - (g.count * 15)} r="4" fill="var(--bg-primary)" stroke="var(--accent-primary)" strokeWidth="2" />
                  ))}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  {stats.userGrowth?.map((g, i) => (
                    <span key={i} style={{ fontSize: '0.7rem', color: '#64748b' }}>{g.month.slice(0, 3)}</span>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-card-static fade-in">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>👥 User Management</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Name', 'Email', 'Role', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem' }}>{u.name}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <select className="input-field" style={{ padding: '0.25rem', fontSize: '0.8rem' }} value={u.role} onChange={e => updateRole(u.user_id, e.target.value)}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.user_id)} style={{ fontWeight: 700, letterSpacing: '0.02em' }}>Eliminate User</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="glass-card-static fade-in">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>⚠️ Complaints</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Reporter', 'Reported', 'Reason', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.complaint_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem' }}>{c.reporter_name}</td>
                    <td style={{ padding: '0.75rem' }}>{c.reported_name}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{c.reason}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <select className="input-field" style={{ padding: '0.25rem', fontSize: '0.8rem' }} value={c.status} onChange={e => updateComplaintStatus(c.complaint_id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(c.reported_id)} title="Delete user and all data">Perm-Ban</button>
                        <button className="btn btn-sm" onClick={() => deleteComplaint(c.complaint_id)} style={{ background: 'rgba(255,255,255,0.05)' }}>Clear Record</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
