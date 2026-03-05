const mysql = require('mysql2/promise');

async function probe() {
    const users = ['root', 'admin', 'dbuser'];
    const hosts = ['localhost', '127.0.0.1'];

    for (const user of users) {
        for (const host of hosts) {
            try {
                console.log(`Probing ${user}@${host}...`);
                const connection = await mysql.createConnection({
                    host,
                    user,
                    password: '0007',
                });
                console.log(`✅ SUCCESS: Connected as ${user}@${host}`);
                await connection.end();
                return;
            } catch (err) {
                console.log(`❌ Failed: ${err.message}`);
            }
        }
    }
}

probe();
