const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function setupDatabase() {
  console.log('🔧 Setting up Campus Skill Exchange database...\n');
  
  // Connect without database first to create it
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  try {
    // Read and execute schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schema);
    console.log('✅ Database and tables created successfully!');
    console.log('✅ Seed data inserted!');
    console.log('\n📊 Tables created:');
    
    const [tables] = await connection.query('SHOW TABLES FROM campus_skill_exchange');
    tables.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`   • ${tableName}`);
    });
    
    console.log('\n🚀 Database is ready! Run "npm run dev" to start the server.');
  } catch (err) {
    console.error('❌ Error setting up database:', err.message);
  } finally {
    await connection.end();
  }
}

setupDatabase();
