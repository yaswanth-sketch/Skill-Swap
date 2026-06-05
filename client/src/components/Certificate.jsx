import React from 'react';

export default function Certificate({ user, skillTitle, date }) {
  return (
    <div className="glass-card" style={{ 
      width: '100%', 
      maxWidth: '800px', 
      margin: '2rem auto', 
      padding: '4rem', 
      background: 'white', 
      color: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
      border: '20px solid #f8fafc',
      boxShadow: '0 50px 100px rgba(0,0,0,0.3)',
      fontFamily: "'Playfair Display', serif"
    }}>
      {/* Decorative Border */}
      <div style={{ position: 'absolute', inset: '10px', border: '2px solid #e2e8f0' }} />
      <div style={{ position: 'absolute', inset: '20px', border: '1px solid #94a3b8' }} />
      
      {/* Content */}
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#1e293b' }}>
          CERTIFICATE
        </div>
        <div style={{ fontSize: '1rem', letterSpacing: '0.4em', color: '#64748b', marginBottom: '3rem' }}>
          OF ACHIEVEMENT
        </div>
        
        <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '2rem' }}>
          This is to certify that
        </p>
        
        <div style={{ fontSize: '3rem', fontWeight: 700, borderBottom: '2px solid #1e293b', display: 'inline-block', padding: '0 3rem 0.5rem 3rem', marginBottom: '2.5rem', color: '#0f172a' }}>
          {user.name}
        </div>
        
        <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '1rem' }}>
          has successfully completed the comprehensive course on
        </p>
        
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4338ca', marginBottom: '3rem' }}>
          {skillTitle}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', padding: '0 4rem' }}>
          <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>DATE</div>
             <div style={{ fontWeight: 700 }}>{date}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '3rem', marginTop: '-1.5rem', opacity: 0.1 }}>🏆</div>
             <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PLATFORM VERIFIED</div>
          </div>
          <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>DIRECTOR</div>
             <div style={{ fontWeight: 700, fontStyle: 'italic', borderTop: '1px solid #1e293b', paddingTop: '0.5rem' }}>Campus Skill Exchange</div>
          </div>
        </div>
      </div>
      
      {/* Background Seal */}
      <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', fontSize: '20rem', opacity: 0.03, transform: 'rotate(-20deg)' }}>
        🎓
      </div>
    </div>
  );
}
