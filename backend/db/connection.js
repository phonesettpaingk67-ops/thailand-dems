const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.DATABASE_USER || process.env.DB_USER || 'root',
  password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.DATABASE_NAME || process.env.DB_NAME || 'disaster_management_db',
  port: process.env.DATABASE_PORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Database config:', {
      host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
      user: process.env.DATABASE_USER || process.env.DB_USER || 'root',
      database: process.env.DATABASE_NAME || process.env.DB_NAME || 'disaster_management_db',
      port: process.env.DATABASE_PORT || process.env.DB_PORT || 3306,
      hasPassword: !!(process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD)
    });
    return;
  }
  console.log('✅ Database connected successfully');
  connection.release();
});

module.exports = promisePool;
