import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [topics, setTopics] = useState([]);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/topics').then(res => setTopics(res.data)).catch(() => {});
  }, []);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { label: '', color: 'transparent', width: '0%', isAcceptable: false };

    if (pass.length > 5) score += 1;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score < 3 || pass.length < 6) return { label: 'Weak', color: '#ef4444', width: '33%', isAcceptable: false };
    if (score >= 3 && score < 5) return { label: 'Medium', color: '#f59e0b', width: '66%', isAcceptable: true };
    return { label: 'Strong', color: '#10b981', width: '100%', isAcceptable: true };
  };

  const strength = calculatePasswordStrength(password);

  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!strength.isAcceptable) {
      setError('Please choose a stronger password (must be Medium or Strong).');
      return;
    }
    setError('');
    setMsg('');
    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { email, department, newPassword: password });
      setMsg(res.data.message || 'Password reset successful!');
      setTimeout(() => {
        setIsForgotPassword(false);
        setPassword('');
        setDepartment('');
        setMsg('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logo}>🔄</div>
          <h1 style={styles.brandName}>SkillSwap</h1>
          <p style={styles.tagline}>Campus Skill Exchange & Micro-Learning</p>
        </div>

        {topics.length > 0 && (
          <div style={styles.topicsPreview}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', textAlign: 'center' }}>Discover Skills Like:</p>
            <div style={styles.topicsScroll}>
              {topics.slice(0, 10).map(t => (
                <span key={t.tag_id} style={styles.topicPill}>{t.tag_name}</span>
              ))}
            </div>
          </div>
        )}

        {!isForgotPassword ? (
          <form onSubmit={handleLoginSubmit}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            
            {error && <div style={styles.error}>{error}</div>}
            {msg && <div style={styles.success}>{msg}</div>}

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Password</label>
                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }} onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setError(''); setPassword(''); }}>Forgot Password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p style={styles.footerText}>
              Don't have an account? <Link to="/register">Create one</Link>
            </p>

          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <h2 style={styles.formTitle}>Reset Password</h2>
            
            {error && <div style={styles.error}>{error}</div>}
            {msg && <div style={styles.success}>{msg}</div>}

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Answer the security question associated with your profile to reset your password.
            </p>

            <div className="input-group">
              <label>Email *</label>
              <input type="email" className="input-field" placeholder="you@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Verification: Your Department *</label>
              <input 
                className="input-field" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
                list="reset-departments-list" 
                placeholder="Search or Select your department" 
                autoComplete="off"
                required 
              />
              <datalist id="reset-departments-list">
                <option value="Computer Science" />
                <option value="Electronics" />
                <option value="Mechanical" />
                <option value="Civil" />
                <option value="Design" />
                <option value="Mathematics" />
                <option value="Physics" />
                <option value="Business" />
              </datalist>
            </div>

            <div className="input-group">
              <label>New Password *</label>
              <input className="input-field" type="password" placeholder="Min 6 characters, mixed case, numbers/symbols" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              {password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={styles.strengthContainer}>
                    <div style={{ ...styles.strengthBar, width: strength.width, backgroundColor: strength.color }}></div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.25rem' }}>
                    Password Strength: {strength.label}
                  </p>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading || !strength.isAcceptable && password.length > 0}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <p style={styles.footerText}>
              Remembered? <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setError(''); setPassword(''); }}>Back to Login</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
    animation: 'float 8s ease-in-out infinite',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
    animation: 'float 10s ease-in-out infinite reverse',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(17, 24, 39, 0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '2.5rem',
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logo: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    marginBottom: '0.75rem',
  },
  brandName: {
    fontSize: '1.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  tagline: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '1.25rem',
    color: '#f1f5f9',
  },
  error: {
    padding: '0.75rem',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  success: {
    padding: '0.75rem',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    color: '#10b981',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '1.25rem',
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  strengthContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  strengthBar: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease'
  },
  topicsPreview: {
    marginBottom: '1.5rem',
    background: 'rgba(255,255,255,0.02)',
    padding: '0.75rem',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  topicsScroll: {
    display: 'flex',
    overflowX: 'auto',
    gap: '0.5rem',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none' // IE
  },
  topicPill: {
    padding: '0.3rem 0.75rem',
    borderRadius: '20px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    color: '#818cf8',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    fontWeight: '600'
  }
};
