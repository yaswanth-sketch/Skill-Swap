import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TeachDashboard() {
  const { topicName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);
  const [duration, setDuration] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePostVideo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const skillsRes = await API.get(`/skills?search=${topicName}`);
      let mySkill = skillsRes.data.find(s => s.user_id === user.user_id);
      
      let skillId;
      if (!mySkill) {
        const createRes = await API.post('/skills', {
          title: `Teaching ${topicName}`,
          description: `My lessons for ${topicName}`,
          level: 'intermediate',
          tags: [topicName]
        });
        skillId = createRes.data.skillId || createRes.data.insertId || createRes.data.id;
      } else {
        skillId = mySkill.skill_id;
      }

      if (!skillId) throw new Error("Could not setup skill bucket for this topic.");
      if (!videoFile) throw new Error("Please select a video file.");

      const formData = new FormData();
      formData.append('skill_id', skillId);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('duration_secs', duration * 60);
      formData.append('order_num', 1);
      formData.append('video', videoFile);
      if (notesFile) formData.append('notes', notesFile);

      await API.post('/lessons', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Video Lesson & Study Materials posted successfully!');
      setTitle('');
      setContent('');
      setVideoFile(null);
      setNotesFile(null);
      setDuration(10);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || err.message || 'Failed to post lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/topic/${encodeURIComponent(topicName)}`)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        <h1 className="page-title">Teaching {topicName}</h1>
        <p className="page-subtitle">Post new video lessons and study materials for students</p>
      </div>

      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Upload Lesson & Materials</h2>
        
        {message && (
          <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: message.includes('successfully') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: message.includes('successfully') ? '#10b981' : '#ef4444' }}>
            {message}
          </div>
        )}

        <form onSubmit={handlePostVideo}>
          <div className="input-group">
            <label>Lesson Title *</label>
            <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Map, Filter, Reduce clearly explained" />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea className="input-field" value={content} onChange={e => setContent(e.target.value)} placeholder="What will they learn in this video?" rows={3} />
          </div>
          <div className="input-group">
            <label>Video File (MP4, MKV, etc.) *</label>
            <input type="file" accept="video/*" className="input-field" onChange={e => setVideoFile(e.target.files[0])} required />
          </div>
          <div className="input-group">
            <label>Study Material (PDF/Notes - Optional)</label>
            <input type="file" accept=".pdf,.doc,.docx" className="input-field" onChange={e => setNotesFile(e.target.files[0])} />
          </div>
          <div className="input-group">
            <label>Approximate Duration (mins)</label>
            <input type="number" min="1" className="input-field" value={duration} onChange={e => setDuration(parseInt(e.target.value))} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Posting...' : 'Post Video Lesson'}
          </button>
        </form>
      </div>
    </div>
  );
}
