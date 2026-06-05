import { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ReportPage() {
  const [reason, setReason] = useState('');
  const [type, setType] = useState('problem');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // For general reports, we use a default "reported_id" (Admin user with ID 1)
      // or we can modify the backend to allow null. 
      // Given the current schema, we'll use ID 1 (Admin).
      await API.post('/complaints', { 
        reported_id: 1, // Admin user ID from schema seed
        reason: `[${type.toUpperCase()}] ${reason}`
      });
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-container">
        <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '4rem auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📩</div>
          <h1 style={{ marginBottom: '1rem' }}>Thank You!</h1>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Your feedback has been received. Our admin team will review it and take action if necessary.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1 className="page-title">📢 Help & Support</h1>
        <p className="page-subtitle">Report a problem or share your feedback with us</p>
      </div>

      <div className="glass-card fade-in">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>What would you like to report?</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div 
                onClick={() => setType('problem')}
                style={{ 
                  padding: '1rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid',
                  borderColor: type === 'problem' ? 'var(--accent-primary)' : 'var(--border-color)',
                  background: type === 'problem' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-glass)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛠️</div>
                <div style={{ fontWeight: 600 }}>Technical Problem</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bugs, crashes, or feature issues</div>
              </div>
              <div 
                onClick={() => setType('feedback')}
                style={{ 
                  padding: '1rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid',
                  borderColor: type === 'feedback' ? 'var(--accent-primary)' : 'var(--border-color)',
                  background: type === 'feedback' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-glass)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💡</div>
                <div style={{ fontWeight: 600 }}>Feedback/Suggestion</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ideas to improve the platform</div>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Details *</label>
            <textarea 
              className="input-field" 
              placeholder="Please describe the issue or your suggestion in detail..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{ minHeight: '150px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          For reporting a specific user, please use the "Report" button in the chat.
        </p>
      </div>
    </div>
  );
}
