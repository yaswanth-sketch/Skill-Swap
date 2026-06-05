import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import API from '../services/api';

import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (user) {
      API.get('/notifications').then(res => {
        const unread = res.data.filter(n => !n.is_read).length;
        setNotifCount(unread);
      }).catch(() => {});
    }
  }, [user, location]);

  useEffect(() => {
    if (socket) {
      const handleNotif = () => setNotifCount(prev => prev + 1);
      socket.on('notification', handleNotif);
      return () => socket.off('notification', handleNotif);
    }
  }, [socket]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🔄</span>
          <span>SkillSwap</span>
        </Link>

        <button className="mobile-nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            🏠 Topics
          </Link>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            📊 Dashboard
          </Link>
          <Link to="/sessions" className={`nav-link ${isActive('/sessions') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            📅 Sessions
          </Link>
          <Link to="/chat" className={`nav-link ${isActive('/chat') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            💬 Chat
          </Link>
          <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            🏆 Leaderboard
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              ⚙️ Admin
            </Link>
          )}
          <Link to="/report" className={`nav-link ${isActive('/report') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            📢 Report
          </Link>
        </div>

        <div className="navbar-actions">
          <div className="streak-counter" title="Users currently online" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '20px', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
            <span className="online-indicator" style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
            {onlineUsers.length} Online
          </div>
          <div className="streak-counter" title="Current Login Streak" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '20px', color: '#fbbf24', fontWeight: 600 }}>
            🔥 {user.current_streak || 0}
          </div>
          <button className="notif-btn" title="Notifications" onClick={() => navigate('/notifications')}>
            🔔
            {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
          </button>
          <div className="user-menu" onClick={() => navigate(`/profile/${user.user_id}`)}>
            <div className="avatar avatar-sm">{user.name?.charAt(0)}</div>
            <span className="user-name">{user.name?.split(' ')[0]}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
