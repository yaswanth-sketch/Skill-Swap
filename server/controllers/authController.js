const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper to evaluate and update streak
async function processStreak(userId) {
  try {
    const [users] = await db.query('SELECT last_login_date, current_streak, max_streak FROM users WHERE user_id = ?', [userId]);
    if (users.length === 0) return;
    const user = users[0];
    
    // Safely extract strictly local YYYY-MM-DD
    const t = new Date();
    const todayYMD = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;

    let streak = user.current_streak || 0;
    let max = user.max_streak || 0;
    let updateNeeded = false;

    let lastYMD = null;
    if (user.last_login_date) {
      // Assuming mysql2 parses DATE column to local midnight time by default
      const d = new Date(user.last_login_date);
      lastYMD = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    if (!lastYMD) {
      streak = 1;
      max = Math.max(streak, max);
      updateNeeded = true;
    } else if (lastYMD !== todayYMD) {
      // It's a new day! Calculate true difference based on midnight
      const MS_PER_DAY = 1000 * 3600 * 24;
      const t1 = new Date(`${todayYMD}T00:00:00`).getTime();
      const t2 = new Date(`${lastYMD}T00:00:00`).getTime();
      const diffDays = Math.round((t1 - t2) / MS_PER_DAY);

      if (diffDays === 1) {
        streak += 1;
        max = Math.max(streak, max);
        updateNeeded = true;
      } else if (diffDays > 1) {
        streak = 1;
        updateNeeded = true;
      }
    }

    if (updateNeeded) {
      await db.query(
        'UPDATE users SET last_login_date = ?, current_streak = ?, max_streak = ? WHERE user_id = ?',
        [todayYMD, streak, max, userId]
      );
      
      // Assign badges
      let badgeTitle = null;
      if (streak === 3) badgeTitle = '3 Day Streak';
      if (streak === 7) badgeTitle = '7 Day Streak';
      
      if (badgeTitle) {
        const [badges] = await db.query('SELECT badge_id FROM badges WHERE title = ?', [badgeTitle]);
        if (badges.length > 0) {
          const badgeId = badges[0].badge_id;
          await db.query('INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badgeId]);
        }
      }
    }
  } catch (err) {
    console.error('Streak processing error:', err);
  }
}


// Register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, department, year_of_study, bio } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Backend password strength validation
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 7) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score < 3 || password.length < 6) {
      return res.status(400).json({ error: 'Password does not meet the minimum strength requirements (must score Medium or above).' });
    }

    // Check if user exists
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    let role = 'student';
    if (email === 'yaswanth.chittiboina999@gmail.com') {
      role = 'admin';
    }

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, department, year_of_study, bio, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, password_hash, department || null, year_of_study || null, bio || null, role]
    );

    // Generate token
    const token = jwt.sign(
      { user_id: result.insertId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { user_id: result.insertId, name, email, role }
    });
  } catch (err) {
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Process streak
    await processStreak(user.user_id);

    // Refetch user to get updated streak data
    const [updatedUsers] = await db.query('SELECT * FROM users WHERE user_id = ?', [user.user_id]);
    const updatedUser = updatedUsers[0];

    // Generate token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        department: updatedUser.department,
        year_of_study: updatedUser.year_of_study,
        bio: updatedUser.bio,
        profile_pic: updatedUser.profile_pic,
        role: updatedUser.role,
        current_streak: updatedUser.current_streak,
        max_streak: updatedUser.max_streak
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    // Process streak before returning
    await processStreak(req.user.user_id);

    const [users] = await db.query(
      'SELECT user_id, name, email, department, year_of_study, bio, profile_pic, role, created_at, current_streak, max_streak FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(users[0]);
  } catch (err) {
    next(err);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, department, newPassword } = req.body;

    if (!email || !department || !newPassword) {
      return res.status(400).json({ error: 'Email, Verification Department, and New Password are required.' });
    }

    // Backend password strength validation
    let score = 0;
    if (newPassword.length > 5) score += 1;
    if (newPassword.length > 7) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score < 3 || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password does not meet the minimum strength requirements.' });
    }

    // Find the user
    const [users] = await db.query('SELECT user_id, department FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Email not found.' });
    }

    const user = users[0];

    // Verify department step
    if (!user.department || user.department.toLowerCase() !== department.toLowerCase()) {
      return res.status(401).json({ error: 'Verification failed. The department provided does not match your profile.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update the database
    await db.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [password_hash, email]
    );

    res.json({ message: 'Password has been successfully changed.' });

  } catch (err) {
    next(err);
  }
};
