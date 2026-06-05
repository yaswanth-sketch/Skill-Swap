-- Campus Skill Exchange & Micro-Learning Platform
-- MySQL Schema

DROP DATABASE IF EXISTS campus_skill_exchange;
CREATE DATABASE IF NOT EXISTS campus_skill_exchange;
USE campus_skill_exchange;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department    VARCHAR(100),
  year_of_study TINYINT,
  bio           TEXT,
  skills_known  TEXT DEFAULT NULL,
  profile_pic   VARCHAR(255) DEFAULT NULL,
  role          ENUM('student','admin') DEFAULT 'student',
  last_login_date DATE DEFAULT NULL,
  current_streak INT DEFAULT 0,
  max_streak    INT DEFAULT 0,
  points        INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skills
CREATE TABLE IF NOT EXISTS skills (
  skill_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  category    VARCHAR(100),
  level       ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Tags
CREATE TABLE IF NOT EXISTS tags (
  tag_id   INT AUTO_INCREMENT PRIMARY KEY,
  tag_name VARCHAR(60) UNIQUE NOT NULL
);

-- 4. Skill Tags (junction)
CREATE TABLE IF NOT EXISTS skill_tags (
  skill_id INT NOT NULL,
  tag_id   INT NOT NULL,
  PRIMARY KEY (skill_id, tag_id),
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)   REFERENCES tags(tag_id)    ON DELETE CASCADE
);

-- 5. Sessions
CREATE TABLE IF NOT EXISTS sessions (
  session_id     INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id     INT NOT NULL,
  learner_id     INT NOT NULL,
  skill_id       INT NOT NULL,
  scheduled_at   DATETIME NOT NULL,
  duration_mins  INT DEFAULT 60,
  status         ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(user_id),
  FOREIGN KEY (learner_id) REFERENCES users(user_id),
  FOREIGN KEY (skill_id)   REFERENCES skills(skill_id)
);

-- 6. Micro-Lessons
CREATE TABLE IF NOT EXISTS micro_lessons (
  lesson_id    INT AUTO_INCREMENT PRIMARY KEY,
  skill_id     INT NOT NULL,
  created_by   INT NOT NULL,
  title        VARCHAR(200) NOT NULL,
  content      TEXT,
  content_url  VARCHAR(255),
  duration_secs INT DEFAULT 0,
  order_num    INT DEFAULT 1,
  views        INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (skill_id)   REFERENCES skills(skill_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 7. Progress Tracking
CREATE TABLE IF NOT EXISTS progress (
  progress_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  lesson_id    INT NOT NULL,
  completed    BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  UNIQUE KEY uq_user_lesson (user_id, lesson_id),
  FOREIGN KEY (user_id)   REFERENCES users(user_id),
  FOREIGN KEY (lesson_id) REFERENCES micro_lessons(lesson_id)
);

-- 8. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  review_id   INT AUTO_INCREMENT PRIMARY KEY,
  session_id  INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  rating      TINYINT,
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id)  REFERENCES sessions(session_id),
  FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
  FOREIGN KEY (reviewee_id) REFERENCES users(user_id)
);

-- 9. Messages
CREATE TABLE IF NOT EXISTS messages (
  message_id  INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  body        TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  sent_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(user_id),
  FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  notif_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message    VARCHAR(255) NOT NULL,
  type       VARCHAR(50) DEFAULT 'info',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 11. Badges
CREATE TABLE IF NOT EXISTS badges (
  badge_id    INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  icon_url    VARCHAR(255)
);

-- 12. User Badges (junction)
CREATE TABLE IF NOT EXISTS user_badges (
  user_id    INT NOT NULL,
  badge_id   INT NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id)  REFERENCES users(user_id),
  FOREIGN KEY (badge_id) REFERENCES badges(badge_id)
);

-- 13. Lesson Comments
CREATE TABLE IF NOT EXISTS lesson_comments (
  comment_id  INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id   INT NOT NULL,
  user_id     INT NOT NULL,
  body        TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES micro_lessons(lesson_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(user_id) ON DELETE CASCADE
);

-- 14. Complaints
CREATE TABLE IF NOT EXISTS complaints (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id  INT NOT NULL,
  reported_id  INT NOT NULL,
  reason       TEXT NOT NULL,
  status       ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reported_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 15. Message Reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  reaction_id INT AUTO_INCREMENT PRIMARY KEY,
  message_id  INT NOT NULL,
  user_id     INT NOT NULL,
  emoji       VARCHAR(10) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_msg_user (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ========== SEED DATA ==========

-- Default badges
INSERT INTO badges (title, description, icon_url) VALUES
('First Skill', 'Listed your first skill', '🎯'),
('Teacher Pro', 'Completed 10 teaching sessions', '🏆'),
('Fast Learner', 'Completed 5 lessons in a day', '⚡'),
('Social Star', 'Received 10+ five-star reviews', '⭐'),
('Contributor', 'Created 5+ micro-lessons', '📚'),
('3 Day Streak', 'Logged in for 3 consecutive days', '🔥'),
('7 Day Streak', 'Logged in for 7 consecutive days', '🚀');

-- Default tags
INSERT INTO tags (tag_name) VALUES
('Python'), ('JavaScript'), ('React'), ('MySQL'), ('Java'),
('C++'), ('Machine Learning'), ('Web Development'), ('Data Science'), ('Mobile Dev'),
('UI/UX Design'), ('Cloud Computing'), ('Cybersecurity'), ('DevOps'), ('Blockchain'),
('Photography'), ('Music'), ('Public Speaking'), ('Mathematics'), ('English'),
('TypeScript'), ('Go'), ('Rust'), ('Swift'), ('Kotlin'),
('PHP'), ('Ruby'), ('R'), ('MATLAB'), ('Scala'),
('Dart'), ('Flutter'), ('React Native'), ('Angular'), ('Vue.js'),
('Django'), ('Flask'), ('Spring Boot'), ('Express.js'), ('Next.js'),
('Docker'), ('Kubernetes'), ('AWS'), ('Azure'), ('Google Cloud'),
('GraphQL'), ('REST API'), ('MongoDB'), ('PostgreSQL'), ('Firebase'),
('Redis'), ('Git & GitHub'), ('Linux'), ('Networking'), ('Ethical Hacking'),
('Penetration Testing'), ('Data Structures'), ('Algorithms'), ('System Design'), ('Operating Systems'),
('Computer Networks'), ('Artificial Intelligence'), ('Deep Learning'), ('NLP'), ('Computer Vision'),
('TensorFlow'), ('PyTorch'), ('Pandas'), ('NumPy'), ('Power BI'),
('Tableau'), ('Excel Advanced'), ('SQL'), ('NoSQL'), ('Figma'),
('Adobe XD'), ('Photoshop'), ('Illustrator'), ('Blender'), ('Unity'),
('Unreal Engine'), ('Game Development'), ('Android Dev'), ('iOS Dev'), ('Embedded Systems'),
('Arduino'), ('Raspberry Pi'), ('IoT'), ('Robotics'), ('3D Printing'),
('Video Editing'), ('Content Writing'), ('Technical Writing'), ('Communication Skills'), ('Leadership'),
('Time Management'), ('Critical Thinking'), ('Problem Solving'), ('Interview Prep'), ('Resume Building');

-- Admin user
INSERT INTO users (name, email, password_hash, department, year_of_study, bio, role) VALUES
('yaswanth chittiboina', 'yaswanth.chittiboina999@gmail.com', '$2a$10$DXGjofA2QCn3NK2fmAXp/.4VWwmc1PScpxS3M8ARuNlloYFON19mG', 'Computer Science', 2, 'i am admin of this app', 'admin');

