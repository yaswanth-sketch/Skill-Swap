import { useState, useEffect } from 'react';

const ROADMAPS = {
  'Python': [
    { title: 'Basics', desc: 'Syntax, Variables, Data Types', icon: '🐍' },
    { title: 'Flow Control', desc: 'If-Else, Loops, Logic', icon: '🔄' },
    { title: 'Functions', desc: 'Args, Return, Scope', icon: '📦' },
    { title: 'OOP', desc: 'Classes, Objects, Inheritance', icon: '🏛️' },
    { title: 'Projects', desc: 'Web Scraping, Automation', icon: '🚀' }
  ],
  'Web Development': [
    { title: 'HTML/CSS', desc: 'Structure & Styling', icon: '🎨' },
    { title: 'JavaScript', desc: 'DOM Manipulation, ES6', icon: '📜' },
    { title: 'Frameworks', desc: 'React, Vue, or Angular', icon: '⚛️' },
    { title: 'Backend', desc: 'Node.js, Databases', icon: '🖥️' },
    { title: 'Deployment', desc: 'Vercel, Netlify, CI/CD', icon: '🌐' }
  ],
  'Data Science': [
    { title: 'Statistics', desc: 'Probability, Distributions', icon: '📊' },
    { title: 'Python/R', desc: 'Pandas, NumPy, Tidyverse', icon: '🧬' },
    { title: 'ML Models', desc: 'Regression, Clustering', icon: '🤖' },
    { title: 'Visualization', desc: 'Matplotlib, Tableau', icon: '📉' },
    { title: 'Big Data', desc: 'Spark, Hadoop', icon: '☁️' }
  ],
  'Graphic Design': [
    { title: 'Principles', desc: 'Color Theory, Typography', icon: '📐' },
    { title: 'Adobe Tools', desc: 'Photoshop, Illustrator', icon: '🖌️' },
    { title: 'UI/UX', desc: 'Wireframing, Prototyping', icon: '📱' },
    { title: 'Branding', desc: 'Logo Design, Identity', icon: '🏷️' },
    { title: 'Portfolio', desc: 'Showcasing Work', icon: '📁' }
  ]
};

const colors = [
  'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
  'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))',
  'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))',
  'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
  'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
];

export default function LearningRoadmap({ skillTitle }) {
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(1); // Demo: Start with 1 completed

  useEffect(() => {
    const key = Object.keys(ROADMAPS).find(k => skillTitle.toLowerCase().includes(k.toLowerCase())) || 'Python';
    setSteps(ROADMAPS[key]);
  }, [skillTitle]);

  const progressPercent = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="roadmap-container fade-in">
      <div className="roadmap-header" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
          Intelligent Learning Roadmap
        </h2>
        
        {/* Progress Bar */}
        <div style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
            <span>Overall Mastery</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-gradient)', transition: 'width 1s ease' }} />
          </div>
        </div>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Step-by-step guide with dependency-based unlocking</p>
      </div>

      <div className="roadmap-path" style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          position: 'absolute', left: '29px', top: '20px', bottom: '20px', 
          width: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px'
        }} />
        
        {steps.map((step, i) => {
          const isCompleted = i < completedSteps;
          const isLocked = i > completedSteps;
          const isCurrent = i === completedSteps;

          return (
            <div key={i} className="roadmap-step" style={{ 
              marginBottom: '1.5rem', position: 'relative', 
              paddingLeft: '70px',
              animation: `fadeInUp 0.5s ease forwards ${i * 0.1}s`,
              opacity: 0,
              filter: isLocked ? 'grayscale(100%)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ 
                position: 'absolute', left: '15px', top: '15px', 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: isCompleted ? 'var(--accent-primary)' : 'var(--bg-primary)', 
                border: `4px solid ${isLocked ? 'rgba(255,255,255,0.1)' : 'var(--accent-primary)'}`,
                boxShadow: isLocked ? 'none' : '0 0 15px rgba(139, 92, 246, 0.4)', zIndex: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: isCompleted ? '#fff' : 'var(--accent-primary)'
              }}>
                {isCompleted ? '✓' : i + 1}
              </div>
              
              <div className="glass-card" style={{ 
                display: 'flex', alignItems: 'center', gap: '1.5rem', 
                padding: '1.5rem', 
                background: isLocked ? 'rgba(255,255,255,0.01)' : colors[i % colors.length],
                border: isCurrent ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px',
                transition: 'transform 0.3s ease',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.5 : 1
              }}
              onMouseEnter={e => { if (!isLocked) e.currentTarget.style.transform = 'translateX(10px)'; }}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{ 
                  fontSize: '2rem', width: '60px', height: '60px', 
                  borderRadius: '16px', background: isLocked ? 'rgba(255,255,255,0.02)' : 'rgba(139, 92, 246, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  {step.icon}
                  {isLocked && (
                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#ef4444', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
                      🔒
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{isLocked ? 'Prerequisite Required' : step.desc}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {isCompleted ? (
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Mastered</span>
                  ) : isLocked ? (
                    <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>Locked</span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>In Progress</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ 
        marginTop: '2rem', textAlign: 'center', padding: '1.5rem', 
        background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(6,182,212,0.05))',
        border: '1px dashed var(--border-color)'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏁</div>
        <h4 style={{ fontWeight: 700 }}>Mastery Achieved!</h4>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Complete all sessions and projects to earn your certification.</p>
      </div>
    </div>
  );
}
