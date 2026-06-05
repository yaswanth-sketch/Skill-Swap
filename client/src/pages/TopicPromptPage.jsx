import { useParams, useNavigate } from 'react-router-dom';
import LearningRoadmap from '../components/LearningRoadmap';

export default function TopicPromptPage() {
  const { topicName } = useParams();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', color: '#f1f5f9', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {topicName}
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem' }}>How would you like to engage with this topic?</p>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate(`/topic/${encodeURIComponent(topicName)}/learn`)}
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))',
              border: '2px solid rgba(99,102,241,0.5)',
              borderRadius: '24px',
              padding: '2.5rem 3.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#818cf8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
          >
            <span style={{ fontSize: '3rem' }}>📚</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>Learn</span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Watch lessons & book sessions</span>
          </button>

          <button 
            onClick={() => navigate(`/topic/${encodeURIComponent(topicName)}/teach`)}
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.1))',
              border: '2px solid rgba(245,158,11,0.5)',
              borderRadius: '24px',
              padding: '2.5rem 3.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#fbbf24'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
          >
            <span style={{ fontSize: '3rem' }}>👩‍🏫</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>Teach</span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Upload videos & tutor others</span>
          </button>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recommended Learning Path</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
        </div>
        <LearningRoadmap skillTitle={topicName} />
      </div>
    </div>
  );
}
