import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const [showDeleteOpt, setShowDeleteOpt] = useState(null);
  const pressTimer = useRef(null);

  useEffect(() => {
    API.get('/messages/conversations').then(res => {
      setConversations(res.data);
      setLoading(false);
      // Auto-open chat if ?to= param is present
      const toId = searchParams.get('to');
      if (toId) {
        const conv = res.data.find(c => c.user_id === parseInt(toId));
        if (conv) selectConversation(conv);
        else {
          API.get(`/users/${toId}`).then(u => selectConversation({ user_id: u.data.user_id, name: u.data.name, profile_pic: u.data.profile_pic })).catch(() => {});
        }
      }
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('receive_message', (msg) => {
      if (selectedUser && (msg.sender_id === selectedUser.user_id || msg.receiver_id === selectedUser.user_id)) {
        setMessages(prev => [...prev, msg]);
      }
      // Update conversation list
      setConversations(prev => {
        const updated = prev.map(c => c.user_id === msg.sender_id || c.user_id === msg.receiver_id ? { ...c, last_message: msg.body, last_message_time: msg.sent_at } : c);
        return updated;
      });
    });
    socket.on('user_typing', () => setTyping(true));
    socket.on('user_stop_typing', () => setTyping(false));
    socket.on('message_deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.message_id !== messageId));
    });
    socket.on('messages_read', ({ readerId }) => {
      setMessages(prev => prev.map(m => m.receiver_id.toString() === readerId.toString() ? { ...m, is_read: 1 } : m));
    });
    socket.on('message_reacted', ({ messageId, userId, emoji, action }) => {
      setMessages(prev => prev.map(m => {
        if (m.message_id === messageId) {
          let reactions = m.reactions || [];
          if (action === 'removed') {
            reactions = reactions.filter(r => r.user_id !== userId);
          } else if (action === 'updated') {
            reactions = reactions.map(r => r.user_id === userId ? { ...r, emoji } : r);
          } else {
            reactions = [...reactions, { user_id: userId, emoji }];
          }
          return { ...m, reactions };
        }
        return m;
      }));
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('message_deleted');
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = async (conv) => {
    setSelectedUser(conv);
    try {
      const res = await API.get(`/messages/${conv.user_id}`);
      setMessages(res.data);
      if (socket) {
        socket.emit('join_chat', { userId: user.user_id, otherUserId: conv.user_id });
        socket.emit('read_messages', { userId: user.user_id, otherUserId: conv.user_id });
      }
    } catch (err) {
      setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUser) return;
    try {
      const res = await API.post('/messages', { receiver_id: selectedUser.user_id, body: newMsg });
      const msg = res.data;
      setMessages(prev => [...prev, msg]);
      if (socket) {
        socket.emit('send_message', { ...msg, sender_name: user.name });
        socket.emit('stop_typing', { userId: user.user_id, otherUserId: selectedUser.user_id });
      }
      setNewMsg('');
    } catch (err) {
      console.error(err);
    }
  };

  const [suggestions, setSuggestions] = useState([]);
  const commonWords = ['Hello', 'How', 'What', 'When', 'Where', 'Why', 'I am', 'Good', 'Thanks', 'Cool', 'Amazing', 'Perfect', 'Great', 'See you', 'Okay', 'Swapping', 'Skill', 'Teach', 'Learn'];

  const handleTyping = (e) => {
    const val = e.target.value;
    setNewMsg(val);
    
    // Simple predictive text
    if (val.trim()) {
      const lastWord = val.split(' ').pop().toLowerCase();
      if (lastWord.length > 1) {
        const filtered = commonWords.filter(w => w.toLowerCase().startsWith(lastWord)).slice(0, 3);
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }

    if (socket && selectedUser) {
      socket.emit('typing', { userId: user.user_id, otherUserId: selectedUser.user_id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('stop_typing', { userId: user.user_id, otherUserId: selectedUser.user_id });
      }, 1000);
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      const res = await API.post(`/messages/${messageId}/react`, { emoji });
      const { action } = res.data;
      if (socket && selectedUser) {
        socket.emit('react_message', { messageId, userId: user.user_id, otherUserId: selectedUser.user_id, emoji, action });
      }
      // Local update
      setMessages(prev => prev.map(m => {
        if (m.message_id === messageId) {
          let reactions = m.reactions || [];
          if (action === 'removed') {
            reactions = reactions.filter(r => r.user_id !== user.user_id);
          } else if (action === 'updated') {
            reactions = reactions.map(r => r.user_id === user.user_id ? { ...r, emoji } : r);
          } else {
            reactions = [...reactions, { user_id: user.user_id, emoji }];
          }
          return { ...m, reactions };
        }
        return m;
      }));
    } catch (err) {}
  };

  const applySuggestion = (word) => {
    const parts = newMsg.split(' ');
    parts.pop();
    setNewMsg([...parts, word, ''].join(' '));
    setSuggestions([]);
  };

  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim() || !selectedUser) return;
    try {
      await API.post('/complaints', { reported_id: selectedUser.user_id, reason: reportReason });
      alert('User reported successfully to admin');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      alert('Failed to report user');
    }
  };

  const handleTouchStart = (msgId, isMine) => {
    if (!isMine) return;
    if (showDeleteOpt === msgId) {
      setShowDeleteOpt(null);
      return;
    }
    setShowDeleteOpt(null);
    pressTimer.current = setTimeout(() => {
      setShowDeleteOpt(msgId);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await API.delete(`/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m.message_id !== msgId));
      setShowDeleteOpt(null);
      if (socket && selectedUser) {
        socket.emit('delete_message', { messageId: msgId, userId: user.user_id, otherUserId: selectedUser.user_id });
      }
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;

  return (
    <div className="page-container" style={{ padding: '1rem 1.5rem', height: 'calc(100vh - 80px)' }}>
      <div style={{ display: 'flex', gap: '1.5rem', height: '100%' }}>
        {/* Left Sidebar: Conversations & Online Users */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
          
          {/* Online Users Section */}
          <div className="glass-card-static" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', maxHeight: '200px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              Online Now ({onlineUsers.length - 1 > 0 ? onlineUsers.length - 1 : 0})
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="no-scrollbar">
              {onlineUsers.length <= 1 ? (
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No one else is online</div>
              ) : (
                onlineUsers.map(id => {
                  if (id === user.user_id.toString()) return null;
                  const conv = conversations.find(c => c.user_id.toString() === id);
                  return (
                    <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', minWidth: '50px', cursor: 'pointer' }} onClick={() => conv && selectConversation(conv)}>
                      <div className="avatar" style={{ border: '2px solid #10b981', padding: '2px', background: 'transparent' }}>
                        <div className="avatar" style={{ width: '100%', height: '100%' }}>{conv ? conv.name?.charAt(0) : '?'}</div>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '50px' }}>
                        {conv ? conv.name.split(' ')[0] : 'User'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div className="glass-card-static" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '1.25rem', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Messages</h3>
            <div style={{ flex: 1, overflowY: 'auto', marginRight: '-0.5rem', paddingRight: '0.5rem' }}>
              {conversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>✉️</div>
                  No conversations yet.<br/>Message someone from their profile!
                </div>
              ) : (
                conversations.map(conv => (
                  <div key={conv.user_id} onClick={() => selectConversation(conv)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', borderRadius: '16px', cursor: 'pointer',
                    background: selectedUser?.user_id === conv.user_id ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                    border: selectedUser?.user_id === conv.user_id ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease', marginBottom: '0.5rem',
                  }}>
                    <div style={{ position: 'relative' }}>
                      <div className="avatar" style={{ width: '44px', height: '44px' }}>{conv.name?.charAt(0)}</div>
                      {isOnline(conv.user_id) && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid var(--bg-secondary)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.125rem', color: selectedUser?.user_id === conv.user_id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{conv.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message}</div>
                    </div>
                    {conv.unread_count > 0 && (
                      <span style={{ padding: '2px 8px', borderRadius: '10px', background: 'var(--accent-primary)', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>{conv.unread_count}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="glass-card-static" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {!selectedUser ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#64748b' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.2 }}>💬</div>
              <h3 style={{ color: '#94a3b8', fontWeight: 700 }}>Select a Conversation</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Pick someone to start swapping skills!</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ position: 'relative' }}>
                  <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>{selectedUser.name?.charAt(0)}</div>
                  {isOnline(selectedUser.user_id) && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '2px solid var(--bg-secondary)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedUser.name}</div>
                  <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline(selectedUser.user_id) ? '#10b981' : '#64748b' }}></span>
                    <span style={{ color: isOnline(selectedUser.user_id) ? '#10b981' : '#64748b', fontWeight: 500 }}>
                      {typing ? 'typing...' : isOnline(selectedUser.user_id) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowReportModal(true)} style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>⚠️ Report</button>
                </div>
              </div>

              {/* Report Modal */}
              {showReportModal && (
                <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                  <div className="modal-content fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                    <div className="modal-header">
                      <h3 className="modal-title">Report {selectedUser.name}</h3>
                      <button className="modal-close" onClick={() => setShowReportModal(false)}>✕</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>Admin will review this conversation and take necessary actions.</p>
                    <form onSubmit={handleReport}>
                      <textarea
                        className="input-field"
                        style={{ minHeight: '120px', marginBottom: '1.5rem' }}
                        placeholder="Why are you reporting this user? (e.g., spam, harassment, inappropriate content)"
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        required
                      />
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowReportModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>Submit Report</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div style={{ 
                flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', 
                background: 'rgba(6, 10, 19, 0.95)',
                backgroundImage: `radial-gradient(rgba(139, 92, 246, 0.03) 2px, transparent 2px)`,
                backgroundSize: '30px 30px'
              }}>
                {messages.map((msg, i) => {
                  const isMine = msg.sender_id === user.user_id;
                  const showAvatar = i === 0 || messages[i-1].sender_id !== msg.sender_id;
                  
                  return (
                    <div key={msg.message_id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', position: 'relative', marginBottom: !showAvatar ? '-0.4rem' : '0' }}>
                      {!isMine && showAvatar && (
                        <div className="avatar avatar-sm" style={{ alignSelf: 'flex-end', marginRight: '0.5rem', width: '28px', height: '28px', fontSize: '0.7rem' }}>{selectedUser.name?.charAt(0)}</div>
                      )}
                      {!isMine && !showAvatar && <div style={{ width: '33px' }} />}
                      
                      <div 
                        onMouseDown={() => handleTouchStart(msg.message_id, isMine)}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                        onTouchStart={() => handleTouchStart(msg.message_id, isMine)}
                        onTouchEnd={handleTouchEnd}
                        onDoubleClick={() => handleReact(msg.message_id, '❤️')}
                        className="fade-in"
                        style={{
                        maxWidth: '75%', padding: '0.625rem 0.875rem', borderRadius: '14px',
                        background: isMine ? '#2563eb' : 'rgba(255,255,255,0.08)',
                        borderBottomRightRadius: isMine ? '2px' : '14px',
                        borderBottomLeftRadius: isMine ? '14px' : '2px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        border: isMine ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        position: 'relative'
                      }}>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'white' }}>{msg.body}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.65rem', color: isMine ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                            {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                          </span>
                          {isMine && (
                            <span style={{ fontSize: '0.8rem', color: msg.is_read ? '#34d399' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', fontWeight: 900 }}>
                              {msg.is_read ? '✓✓' : '✓✓'}
                            </span>
                          )}
                        </div>
                        
                        {/* Reactions UI */}
                        {msg.reactions?.length > 0 && (
                          <div style={{
                            position: 'absolute', bottom: '-12px', right: isMine ? '10px' : 'auto', left: isMine ? 'auto' : '10px',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                            borderRadius: '12px', padding: '2px 6px', display: 'flex', gap: '2px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 5
                          }}>
                            {[...new Set(msg.reactions.map(r => r.emoji))].map(emoji => (
                              <span key={emoji} style={{ fontSize: '0.75rem' }}>{emoji}</span>
                            ))}
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, marginLeft: '2px', color: 'var(--text-secondary)' }}>{msg.reactions.length}</span>
                          </div>
                        )}
                      </div>

                      {showDeleteOpt === msg.message_id && isMine && (
                        <div style={{
                          position: 'absolute', top: '-25px', right: '0', background: '#ef4444', 
                          color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.75rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.375rem',
                          boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)', fontWeight: 700
                        }} onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.message_id); }}>
                          <span>Delete</span> 🗑️
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '0.75rem 1.5rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Suggestions Bar */}
                {suggestions.length > 0 && (
                  <div className="fade-in" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {suggestions.map(s => (
                      <button 
                        key={s} 
                        className="btn btn-secondary btn-sm" 
                        style={{ borderRadius: '12px', fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                        onClick={() => applySuggestion(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                      className="input-field" 
                      style={{ paddingRight: '3rem', height: '48px', borderRadius: '24px', background: 'rgba(255,255,255,0.04)' }} 
                      placeholder="Write a message..." 
                      value={newMsg} 
                      onChange={handleTyping}
                      spellCheck="true"
                    />
                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.5 }}>😊</div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}>
                    <span style={{ fontSize: '1.2rem' }}>🚀</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
