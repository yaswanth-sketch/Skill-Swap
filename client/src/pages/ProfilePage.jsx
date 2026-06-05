import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const ALL_SKILL_OPTIONS = [
  'Python', 'JavaScript', 'React', 'MySQL', 'Java', 'C++', 'Machine Learning', 'Web Development',
  'Data Science', 'Mobile Dev', 'UI/UX Design', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'Blockchain',
  'Photography', 'Music', 'Public Speaking', 'Mathematics', 'English', 'TypeScript', 'Go', 'Rust', 'Swift',
  'Kotlin', 'PHP', 'Ruby', 'R', 'MATLAB', 'Scala', 'Dart', 'Flutter', 'React Native', 'Angular', 'Vue.js',
  'Django', 'Flask', 'Spring Boot', 'Express.js', 'Next.js', 'Docker', 'Kubernetes', 'AWS', 'Azure',
  'Google Cloud', 'GraphQL', 'REST API', 'MongoDB', 'PostgreSQL', 'Firebase', 'Redis', 'Git & GitHub',
  'Linux', 'Networking', 'Ethical Hacking', 'Penetration Testing', 'Data Structures', 'Algorithms',
  'System Design', 'Operating Systems', 'Computer Networks', 'Artificial Intelligence', 'Deep Learning',
  'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Power BI', 'Tableau',
  'Excel Advanced', 'SQL', 'NoSQL', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Blender',
  'Unity', 'Unreal Engine', 'Game Development', 'Android Dev', 'iOS Dev', 'Embedded Systems',
  'Arduino', 'Raspberry Pi', 'IoT', 'Robotics', '3D Printing', 'Video Editing', 'Content Writing',
  'Technical Writing', 'Communication Skills', 'Leadership', 'Time Management', 'Critical Thinking',
  'Problem Solving', 'Interview Prep', 'Resume Building', 'C', 'C#', '.NET', 'HTML', 'CSS', 'SASS',
  'Node.js', 'Electron', 'Svelte', 'Tailwind CSS', 'Bootstrap',
];

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [skillSearch, setSkillSearch] = useState('');

  useEffect(() => {
    Promise.all([
      API.get(`/users/${id}`),
      API.get(`/reviews/user/${id}`)
    ]).then(([profileRes, reviewsRes]) => {
      setProfile(profileRes.data);
      setReviews(reviewsRes.data);
      setEditForm({
        name: profileRes.data.name,
        department: profileRes.data.department,
        year_of_study: profileRes.data.year_of_study,
        bio: profileRes.data.bio,
        skills_known: profileRes.data.skills_known || ''
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      await API.put(`/users/${id}`, editForm);
      setProfile({ ...profile, ...editForm });
      setEditing(false);
    } catch (err) {
      alert('Update failed');
    }
  };

  const selectedSkills = editForm.skills_known ? editForm.skills_known.split(',').map(s => s.trim()).filter(Boolean) : [];
  const displaySkills = profile?.skills_known ? profile.skills_known.split(',').map(s => s.trim()).filter(Boolean) : [];

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setEditForm({ ...editForm, skills_known: selectedSkills.filter(s => s !== skill).join(', ') });
    } else {
      setEditForm({ ...editForm, skills_known: [...selectedSkills, skill].join(', ') });
    }
  };

  const filteredSkillOptions = ALL_SKILL_OPTIONS.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const isOwner = currentUser?.user_id === parseInt(id);

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;
  if (!profile) return <div className="page-container"><div className="empty-state"><h3>User not found</h3></div></div>;

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div className="glass-card-static" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="avatar avatar-xl">{profile.name?.charAt(0)}</div>
          <div style={{ flex: 1 }}>
            {editing ? (
              <div>
                <div className="input-group"><label>Name</label><input className="input-field" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group"><label>Department</label><input className="input-field" value={editForm.department || ''} onChange={e => setEditForm({ ...editForm, department: e.target.value })} /></div>
                  <div className="input-group"><label>Year</label><input className="input-field" type="number" min="1" max="4" value={editForm.year_of_study || ''} onChange={e => setEditForm({ ...editForm, year_of_study: e.target.value })} /></div>
                </div>
                <div className="input-group"><label>Bio</label><textarea className="input-field" value={editForm.bio || ''} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} /></div>

                {/* Skills Known Picker */}
                <div className="input-group">
                  <label>🎓 Skills You've Learned</label>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>Select all the skills/technologies you already know</p>

                  {/* Selected Skills */}
                  {selectedSkills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {selectedSkills.map(skill => (
                        <span
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          style={{
                            padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.15))',
                            border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {skill} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>✕</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search */}
                  <input
                    className="input-field"
                    placeholder="🔍 Search skills to add..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    style={{ marginBottom: '0.75rem' }}
                  />

                  {/* Options Grid */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                    maxHeight: '180px', overflowY: 'auto', padding: '0.5rem',
                    background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {filteredSkillOptions.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <span
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          style={{
                            padding: '0.3rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 500,
                            background: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isSelected ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                            color: isSelected ? '#a5b4fc' : '#94a3b8', cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? '✓ ' : ''}{skill}
                        </span>
                      );
                    })}
                    {filteredSkillOptions.length === 0 && (
                      <span style={{ color: '#64748b', fontSize: '0.8rem', padding: '0.5rem' }}>No matching skills found</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{profile.name}</h1>
                  {profile.role === 'admin' && <span className="badge badge-warning">👑 Admin</span>}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  {profile.department && <span>{profile.department}</span>}
                  {profile.year_of_study && <span> • Year {profile.year_of_study}</span>}
                </div>
                {profile.bio && <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{profile.bio}</p>}

                {/* Display Skills Known */}
                {displaySkills.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 600 }}>🎓 Skills Known:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {displaySkills.map(skill => (
                        <span key={skill} style={{
                          padding: '0.25rem 0.6rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600,
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))',
                          border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc',
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {isOwner && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>}
                  {!isOwner && <button className="btn btn-primary btn-sm" onClick={() => navigate(`/chat?to=${id}`)}>💬 Message</button>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginTop: '1.5rem' }}>
          <div className="stat-card"><div className="stat-value">{profile.points || 0}</div><div className="stat-label">Total Points</div></div>
          <div className="stat-card"><div className="stat-value">{profile.sessions_taught}</div><div className="stat-label">Sessions Taught</div></div>
          <div className="stat-card"><div className="stat-value">{profile.sessions_learned}</div><div className="stat-label">Sessions Learned</div></div>
          <div className="stat-card"><div className="stat-value">⭐ {profile.avg_rating}</div><div className="stat-label">Avg Rating</div></div>
        </div>
      </div>

      {/* Badges */}
      {profile.badges?.length > 0 && (
        <div className="glass-card-static" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🏅 Badges</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {profile.badges.map(badge => (
              <div key={badge.badge_id} style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>{badge.icon_url}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem' }}>{badge.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="glass-card-static" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🎯 Skills</h3>
        {profile.skills?.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No skills listed yet.</p>
        ) : (
          <div className="grid-2">
            {profile.skills?.map(skill => (
              <div key={skill.skill_id} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/skill/${skill.skill_id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 600 }}>{skill.title}</h4>
                  <span className={`badge ${skill.level === 'beginner' ? 'badge-success' : skill.level === 'intermediate' ? 'badge-warning' : 'badge-danger'}`}>{skill.level}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{skill.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="glass-card-static">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>⭐ Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No reviews yet.</p>
        ) : (
          reviews.map(review => (
            <div key={review.review_id} style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <div className="avatar avatar-sm">{review.reviewer_name?.charAt(0)}</div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{review.reviewer_name}</span>
                <div className="stars">{[1,2,3,4,5].map(n => <span key={n} className={`star ${n <= review.rating ? 'filled' : ''}`}>★</span>)}</div>
              </div>
              {review.comment && <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '2.5rem' }}>{review.comment}</p>}
              <p style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '2.5rem', marginTop: '0.25rem' }}>for {review.skill_title}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
