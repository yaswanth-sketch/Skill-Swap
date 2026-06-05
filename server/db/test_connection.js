const mysql = require('mysql2/promise');

async function testPasswords() {
  const passwords = ['@yash_35@', 'yash_35', 'Yash_35', '@Yash_35@', 'root', 'password', '1234', 'mysql', ''];
  
  for (const pwd of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pwd,
        port: 3306
      });
      console.log(`✅ SUCCESS! Password that works: "${pwd}"`);
      await conn.end();
      return;
    } catch (err) {
      console.log(`❌ Failed with password: "${pwd}" - ${err.message}`);
    }
  }
  console.log('\n⚠️ None of the common passwords worked.');
  console.log('Please open MySQL Workbench or run: mysql -u root -p');
  console.log('and enter your password manually to verify it.');
}

testPasswords();
