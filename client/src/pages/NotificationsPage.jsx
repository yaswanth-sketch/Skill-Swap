import { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notif_id === id ? { ...n, is_read: true } : n));
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/mark-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {}
  };

  const deleteNotif = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.notif_id !== id));
    } catch (err) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'session': return '🤝';
      case 'badge': return '🏆';
      default: return '🔔';
    }
  };

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">🔔 Notifications</h1>
          <p className="page-subtitle">Stay updated with your latest activity</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      <div className="fade-in">
        {notifications.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: '#64748b' }}>All caught up!</h3>
            <p style={{ color: '#94a3b8' }}>No new notifications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(n => (
              <div 
                key={n.notif_id} 
                className={`glass-card ${n.is_read ? 'opacity-60' : ''}`}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem', 
                  padding: '1.25rem',
                  borderLeft: n.is_read ? 'none' : '4px solid var(--accent-primary)',
                  position: 'relative'
                }}
                onClick={() => markRead(n.notif_id)}
              >
                <div style={{ fontSize: '1.75rem' }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: n.is_read ? '#94a3b8' : '#fff' }}>{n.message}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {new Date(n.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {!n.is_read && (
                     <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); markRead(n.notif_id); }}>Read</button>
                   )}
                   <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); deleteNotif(n.notif_id); }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
