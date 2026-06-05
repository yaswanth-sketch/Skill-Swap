import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FeedPage() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
    API.get('/skills/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const fetchSkills = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const res = await API.get(`/skills?${query}`);
      setSkills(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    const params = {};
    if (val) params.search = val;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedLevel) params.level = selectedLevel;
    fetchSkills(params);
  };

  const handleCategoryFilter = (cat) => {
    const newCat = selectedCategory === cat ? '' : cat;
    setSelectedCategory(newCat);
    const params = {};
    if (search) params.search = search;
    if (newCat) params.category = newCat;
    if (selectedLevel) params.level = selectedLevel;
    fetchSkills(params);
  };

  const handleLevelFilter = (level) => {
    const newLevel = selectedLevel === level ? '' : level;
    setSelectedLevel(newLevel);
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (newLevel) params.level = newLevel;
    fetchSkills(params);
  };

  const levelColors = {
    beginner: 'badge-success',
    intermediate: 'badge-warning',
    advanced: 'badge-danger',
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Discover Skills</h1>
          <p className="page-subtitle">Find peers who can teach you something new</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          ➕ Share a Skill
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search skills, topics, or teachers..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Filters */}
      <div className="filter-chips">
        {['beginner', 'intermediate', 'advanced'].map(level => (
          <button key={level} className={`chip ${selectedLevel === level ? 'active' : ''}`} onClick={() => handleLevelFilter(level)}>
            {level}
          </button>
        ))}
        <span style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />
        {categories.map(cat => (
          <button key={cat} className={`chip ${selectedCategory === cat ? 'active' : ''}`} onClick={() => handleCategoryFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : skills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No skills found</h3>
          <p>Try a different search or be the first to share a skill!</p>
        </div>
      ) : (
        <div className="grid-3">
          {skills.map((skill, i) => (
            <div key={skill.skill_id} className="glass-card fade-in" style={{ cursor: 'pointer' }} onClick={() => navigate(`/skill/${skill.skill_id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className={`badge ${levelColors[skill.level]}`}>{skill.level}</span>
                <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⭐ {skill.avg_rating}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f1f5f9' }}>{skill.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {skill.description}
              </p>
              {skill.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {skill.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="badge badge-info">{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="avatar avatar-sm">{skill.teacher_name?.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{skill.teacher_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{skill.department}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Skill Modal */}
      {showCreateModal && <CreateSkillModal onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); fetchSkills(); }} />}
    </div>
  );
}

function CreateSkillModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', category: '', level: 'beginner', tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await API.post('/skills', { ...form, tags });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Share a Skill</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
          <div className="input-group">
            <label>Skill Title *</label>
            <input className="input-field" placeholder="e.g. Python for Data Science" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea className="input-field" placeholder="What will students learn?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Category</label>
              <input className="input-field" placeholder="e.g. Web Development" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Level</label>
              <select className="input-field" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Tags (comma-separated)</label>
            <input className="input-field" placeholder="Python, Data Science, Pandas" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Skill'}
          </button>
        </form>
      </div>
    </div>
  );
}
