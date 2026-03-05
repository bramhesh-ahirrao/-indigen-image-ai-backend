const mysql = require('mysql2/promise');

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 33060,
            user: 'root',
            password: '0007',
        });
        console.log('✅ Connection to MySQL successful on 33060');
        await connection.end();
    } catch (error) {
        console.error('❌ Connection on 33060 failed:', error.message);
    }
}

test();
