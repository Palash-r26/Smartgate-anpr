const mysql = require('mysql2/promise');

const passwords = [
  '',
  'root',
  'admin',
  '1234',
  '123456',
  'root123',
  'mysql',
  'password',
  'sarvesh',
  'sarveshsingh',
  'admin123',
  'myappcivic',
  'APL072631',
  'admin@123',
  'root@123',
  '12345678',
  '123456789'
];

async function test() {
  for (const pw of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pw
      });
      console.log(`SUCCESS: Connected with password "${pw}"`);
      await conn.end();
      return;
    } catch (err) {
      console.log(`Failed with password "${pw}": ${err.message}`);
    }
  }
}

test();
