import 'dotenv/config';
import mysql, { Pool } from 'mysql2/promise';

export const pool: Pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || 'YOUR_PASSWORD',
	database: process.env.DB_NAME || 'resource_management',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

export default pool;
