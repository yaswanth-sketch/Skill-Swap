import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We don't have a specific GET /lessons/:id right now, but wait!
    // We can fetch from existing skills/x or just create one?
    // Oh, looking closely we actually do have API.get('/lessons') we can filter, 
    // or we can add a specific get lesson endpoint if it's not there.
    // Wait, let's just fetch all lessons and find it, or let's assume /lessons/:id works.
    
    // Instead of risking a missing endpoint, let's fetch all lessons and find:
    API.get('/lessons').then(res => {
      const current = res.data.find(l => l.lesson_id.toString() === id);
      setLesson(current);
      if (current) {
        // Record view
        API.post(`/lessons/${id}/view`).catch(() => {});

        API.get(`/comments/${id}`).then(cRes => {
          setComments(cRes.data);
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await API.post(`/comments/${id}`, { body: newComment });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const getVideoUrl = (url) => {
    if (!url) return null;
    // Assuming backend is proxying or serving via absolute DEV path when required, but we can just use relative
    if (url.startsWith('/uploads')) {
      return 'http://localhost:5000' + url; // Ensure it points to backend in dev
    }
    return url;
  };

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;
  if (!lesson) return <div className="page-container"><div className="empty-state"><h3>Video not found</h3><button className="btn btn-primary mt-2" onClick={() => navigate(-1)}>Go Back</button></div></div>;

  const videoUrl = getVideoUrl(lesson.content_url);

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      {/* Video Player */}
      <div style={{ background: '#0f172a', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
        {videoUrl ? (
          <video 
            src={videoUrl}
            controls
            style={{ width: '100%', maxHeight: '600px', display: 'block' }}
          />
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <p>No video source available.</p>
          </div>
        )}
      </div>

      {/* Details */}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f1f5f9' }}>{lesson.title}</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
        <div className="avatar">{lesson.teacher_name?.charAt(0) || 'T'}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{lesson.teacher_name || 'Teacher'}</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <p style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>{lesson.content}</p>
        
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>Ready for the Assignment?</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Complete the 5-question test to validate your learning.</p>
            </div>
            {lesson.notes_url && (
              <a 
                href={`http://localhost:5000${lesson.notes_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary" 
                style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <span>📚</span> Download Notes
              </a>
            )}
          </div>
          <button 
            className="btn btn-primary" 
            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => navigate(`/topic/${encodeURIComponent(lesson.skill_title || 'General')}/quiz`)}
          >
            <span>📝</span> Take Assignment
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        {comments.length} Comments
      </h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="avatar avatar-sm">{user.name?.charAt(0)}</div>
        <form onSubmit={handlePostComment} style={{ flex: 1 }}>
          <input 
            type="text" 
            placeholder="Add a comment..." 
            value={newComment} 
            onChange={e => setNewComment(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 0', color: '#fff', fontSize: '1rem' }}
          />
          {newComment.trim() && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">Comment</button>
            </div>
          )}
        </form>
      </div>

      <div>
        {comments.map(c => (
          <div key={c.comment_id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="avatar avatar-sm">{c.user_name?.charAt(0)}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.user_name}</span>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
