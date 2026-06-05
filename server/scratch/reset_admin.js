const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function resetAdmin(newPass = 'Admin@123') {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campus_skill_exchange',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
  });

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPass, salt);

  const [result] = await connection.execute(
    'UPDATE users SET password_hash = ? WHERE email = ?',
    [hash, 'yaswanth.chittiboina999@gmail.com']
  );

  if (result && result.affectedRows > 0) {
    console.log('Admin password reset successfully to:', newPass);
  } else {
    console.error('No user updated — check that the admin email exists in the database.');
  }

  await connection.end();
}

// Allow passing a password via CLI: `node reset_admin.js MyNewP@ssw0rd`
const argPass = process.argv[2];
resetAdmin(argPass).catch(err => {
  console.error('Error resetting admin password:', err.message || err);
  process.exit(1);
});
