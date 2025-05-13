import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Sin123456',
  database: process.env.DB_NAME || 'school_management',
  waitForConnections: true,
  charset: 'utf8mb4' 
});

export default pool;
