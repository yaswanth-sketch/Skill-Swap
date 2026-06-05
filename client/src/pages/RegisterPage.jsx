import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', year_of_study: '', bio: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/topics').then(res => setTopics(res.data)).catch(() => {});
  }, []);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { label: '', color: 'transparent', width: '0%', isAcceptable: false };

    if (password.length > 5) score += 1;
    if (password.length > 7) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score < 3 || password.length < 6) return { label: 'Weak', color: '#ef4444', width: '33%', isAcceptable: false };
    if (score >= 3 && score < 5) return { label: 'Medium', color: '#f59e0b', width: '66%', isAcceptable: true };
    return { label: 'Strong', color: '#10b981', width: '100%', isAcceptable: true };
  };

  const strength = calculatePasswordStrength(form.password);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!strength.isAcceptable) {
      setError('Please choose a stronger password (must be Medium or Strong).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ ...form, year_of_study: form.year_of_study ? parseInt(form.year_of_study) : null });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={styles.logo}>🔄</div>
          <h1 style={styles.brand}>Join SkillSwap</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Start exchanging skills on campus</p>
        </div>

        {topics.length > 0 && (
          <div style={styles.topicsPreview}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', textAlign: 'center' }}>Connect over topics like:</p>
            <div style={styles.topicsScroll}>
              {topics.slice(0, 10).map(t => (
                <span key={t.tag_id} style={styles.topicPill}>{t.tag_name}</span>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

          <div className="input-group">
            <label>Full Name *</label>
            <input className="input-field" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Email *</label>
            <input className="input-field" type="email" name="email" placeholder="you@campus.edu" value={form.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Password *</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field" 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Min 6 characters, mixed case, numbers/symbols" 
                value={form.password} 
                onChange={handleChange} 
                style={{ paddingRight: '2.5rem' }}
                required 
                minLength={6} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={styles.strengthContainer}>
                  <div style={{ ...styles.strengthBar, width: strength.width, backgroundColor: strength.color }}></div>
                </div>
                <p style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.25rem' }}>
                  Password Strength: {strength.label}
                </p>
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Requires at least 6 characters, mixing letters, numbers, and symbols helps make it stronger.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Department</label>
              <input 
                className="input-field" 
                name="department" 
                value={form.department} 
                onChange={handleChange} 
                list="departments-list" 
                placeholder="Search or Select..." 
                autoComplete="off"
              />
              <datalist id="departments-list">
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
              <label>Year of Study</label>
              <select className="input-field" name="year_of_study" value={form.year_of_study} onChange={handleChange}>
                <option value="">Select</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Bio</label>
            <textarea className="input-field" name="bio" placeholder="Tell us about yourself..." value={form.bio} onChange={handleChange} rows="3" style={{ minHeight: '80px' }} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading || !strength.isAcceptable && form.password.length > 0}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
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
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(17, 24, 39, 0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '2.5rem',
  },
  logo: {
    width: '48px', height: '48px',
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    borderRadius: '14px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.5rem', marginBottom: '0.75rem',
  },
  brand: {
    fontSize: '1.4rem', fontWeight: 800,
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
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
