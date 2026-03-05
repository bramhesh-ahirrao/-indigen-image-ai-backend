const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '0007',
        });
        console.log('✅ Connection to MySQL successful (root/0007 @ 127.0.0.1)');

        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS indigen_ai');
        console.log('✅ Database indigen_ai ensured');

        const [rows] = await connection.execute('SHOW DATABASES');
        console.log('Databases:', rows.map(r => r.Database));
        await connection.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();
