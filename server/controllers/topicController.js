const db = require('../config/db');

// Get all topics (tags)
exports.getTopics = async (req, res, next) => {
  try {
    // Optionally count how many skills/lessons each tag has to sort by popularity
    const userId = req.user ? req.user.user_id : 0;
    const [topics] = await db.query(`
      SELECT t.tag_id, t.tag_name, t.prerequisite_tag_id, pt.tag_name as prerequisite_name,
             COUNT(st.skill_id) as skill_count,
             CASE 
               WHEN t.prerequisite_tag_id IS NULL THEN FALSE
               ELSE (
                 -- Check if all lessons completed
                 (SELECT COUNT(*) > 0 AND COUNT(*) = COUNT(CASE WHEN p.completed = TRUE THEN 1 END)
                  FROM micro_lessons ml
                  JOIN skill_tags st2 ON ml.skill_id = st2.skill_id
                  LEFT JOIN progress p ON ml.lesson_id = p.lesson_id AND p.user_id = ?
                  WHERE st2.tag_id = t.prerequisite_tag_id) = TRUE
                 OR
                 -- OR check if Fast Track test passed (75%+)
                 (SELECT COUNT(*) > 0
                  FROM quiz_results qr
                  JOIN skills s2 ON qr.skill_id = s2.skill_id
                  JOIN skill_tags st3 ON s2.skill_id = st3.skill_id
                  WHERE st3.tag_id = t.prerequisite_tag_id 
                  AND qr.user_id = ?
                  AND (qr.score / qr.total_questions) >= 0.75) = TRUE
               ) = FALSE
             END as is_locked
      FROM tags t
      LEFT JOIN skill_tags st ON t.tag_id = st.tag_id
      LEFT JOIN tags pt ON t.prerequisite_tag_id = pt.tag_id
      GROUP BY t.tag_id
      ORDER BY skill_count DESC, t.tag_name ASC
    `, [userId, userId, userId]);
    res.json(topics);
  } catch (err) {
    next(err);
  }
};

// Get lessons for a specific topic
exports.getTopicLessons = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.user_id : 0;
    const [lessons] = await db.query(`
      SELECT ml.*, u.name as teacher_name, u.profile_pic, u.department,
             p.completed as user_completed
      FROM micro_lessons ml
      JOIN skills s ON ml.skill_id = s.skill_id
      JOIN users u ON ml.created_by = u.user_id
      JOIN skill_tags st ON s.skill_id = st.skill_id
      JOIN tags t ON st.tag_id = t.tag_id
      LEFT JOIN progress p ON ml.lesson_id = p.lesson_id AND p.user_id = ?
      WHERE t.tag_name = ?
      ORDER BY ml.created_at DESC
    `, [userId, topicName]);
    res.json(lessons);
  } catch (err) {
    next(err);
  }
};

// Get teachers (available skills) for a specific topic
exports.getTopicTeachers = async (req, res, next) => {
  try {
    const { topicName } = req.params;
    const [teachers] = await db.query(`
      SELECT s.skill_id, s.title, s.level, u.user_id, u.name as teacher_name, u.profile_pic, u.department,
             COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.review_id) as review_count
      FROM skills s
      JOIN users u ON s.user_id = u.user_id
      JOIN skill_tags st ON s.skill_id = st.skill_id
      JOIN tags t ON st.tag_id = t.tag_id
      LEFT JOIN reviews r ON r.reviewee_id = u.user_id
      WHERE t.tag_name = ?
      GROUP BY s.skill_id
      ORDER BY avg_rating DESC
    `, [topicName]);
    
    // Format rating
    teachers.forEach(t => t.avg_rating = parseFloat(t.avg_rating).toFixed(1));
    
    res.json(teachers);
  } catch (err) {
    next(err);
  }
};
