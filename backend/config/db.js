import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from backend root folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'internsphere_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
try {
  const connection = await pool.getConnection();
  console.log('Database Connection Success: Connected to MySQL database.');
  connection.release();
} catch (error) {
  console.warn('Database Connection Warning: Could not connect to MySQL at startup.', error.message);
  console.warn('Please check if MySQL is running locally and credentials match .env.');
}

export default pool;
