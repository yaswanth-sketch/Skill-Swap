import { useState } from 'react';
import API from '../services/api';

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am your AI Roadmap Coach. What skill do you want to learn today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await API.post('/ai/chat', { message: input, context: messages });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error checking the roadmap. Be sure your Gemini API key is configured.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        style={styles.fab} 
        onClick={() => setIsOpen(true)}
        title="PathAI Advisor"
      >
        <span>🔮</span>
      </button>
    );
  }

  return (
    <div style={styles.window} className="glass-card fade-in">
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🔮</span>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>PathAI Advisor</h3>
        </div>
        <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
      </div>

      <div style={styles.chatArea}>
        {messages.map((m, i) => (
          <div key={i} style={m.role === 'ai' ? styles.aiMsgBubble : styles.userMsgBubble}>
            <div dangerouslySetInnerHTML={{ __html: m.text }} style={m.role === 'ai' ? { display: 'flex', flexDirection: 'column', gap: '0.5rem' } : undefined} />
          </div>
        ))}
        {loading && (
          <div style={styles.aiMsgBubble}>
            <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Thinking...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} style={styles.inputArea}>
        <input 
          type="text" 
          placeholder="Ask for a learning roadmap..." 
          value={input}
          onChange={e => setInput(e.target.value)}
          style={styles.input}
          autoFocus
        />
        <button type="submit" style={styles.sendBtn} disabled={loading || !input.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary)',
    color: 'white',
    fontSize: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    boxShadow: 'var(--shadow-glow)',
    cursor: 'pointer',
    zIndex: 9999,
    animation: 'float 4s ease-in-out infinite',
    transition: 'transform 0.2s ease',
  },
  window: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '350px',
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
    padding: 0,
    overflow: 'hidden',
    boxShadow: 'var(--shadow-lg)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.02)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  chatArea: {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  aiMsgBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6,182,212,0.15)',
    border: '1px solid rgba(6,182,212,0.3)',
    borderRadius: '12px 12px 12px 2px',
    padding: '0.75rem',
    maxWidth: '85%',
    fontSize: '0.85rem',
    color: '#e2e8f0',
    lineHeight: '1.4'
  },
  userMsgBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'var(--accent-primary)',
    borderRadius: '12px 12px 2px 12px',
    padding: '0.75rem',
    maxWidth: '85%',
    fontSize: '0.85rem',
    color: 'white',
    lineHeight: '1.4'
  },
  inputArea: {
    display: 'flex',
    padding: '0.75rem',
    borderTop: '1px solid var(--border-color)',
    background: 'rgba(0,0,0,0.2)',
    gap: '0.5rem'
  },
  input: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-full)',
    padding: '0.5rem 1rem',
    color: 'white',
    outline: 'none',
    fontSize: '0.85rem'
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem'
  }
};
