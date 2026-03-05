const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '0007',
        });
        console.log('✅ Connection to MySQL successful');
        await connection.query('CREATE DATABASE IF NOT EXISTS ' + (process.env.DB_NAME || 'indigen_ai'));
        console.log('✅ Database ensured');
        await connection.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

test();
