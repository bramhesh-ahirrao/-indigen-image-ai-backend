const mysql = require('mysql2/promise');

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: '::1',
            user: 'root',
            password: '0007',
        });
        console.log('✅ Connection to MySQL successful on ::1');
        await connection.end();
    } catch (error) {
        console.error('❌ Connection on ::1 failed:', error.message);
    }
}

test();
