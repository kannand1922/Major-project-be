import mysql from 'mysql2/promise';
import { configDotenv } from 'dotenv';

configDotenv();

let pool;

const dbConnect = async () => {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10, // Maximum number of connections in the pool
        queueLimit: 0,       // No limit on connection requests in the queue
      });

      console.log('Database connection pool created successfully');
    } catch (error) {
      console.error('Failed to create database connection pool:', error.message);
      process.exit(1);
    }
  }
  return pool;
};

export default dbConnect;
