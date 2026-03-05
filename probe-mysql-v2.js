const mysql = require('mysql2/promise');

async function probe() {
    const passwords = ['0007', ''];
    const hosts = ['localhost', '127.0.0.1'];

    for (const pwd of passwords) {
        for (const host of hosts) {
            try {
                console.log(`Trying root@${host} with password "${pwd}"...`);
                const connection = await mysql.createConnection({
                    host,
                    user: 'root',
                    password: pwd,
                });
                console.log(`✅ SUCCESS! Connected with password "${pwd}" at ${host}`);
                await connection.end();
                return;
            } catch (err) {
                console.log(`❌ Failed: ${err.message}`);
            }
        }
    }
}

probe();
