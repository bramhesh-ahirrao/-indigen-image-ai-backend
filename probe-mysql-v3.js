const mysql = require('mysql2/promise');

async function probe() {
    const users = ['root', 'admin', 'mysql', 'dbuser'];
    const passwords = ['0007', 'password', 'admin', ''];
    const hosts = ['localhost', '127.0.0.1'];

    for (const user of users) {
        for (const pwd of passwords) {
            for (const host of hosts) {
                try {
                    // console.log(`Probing ${user}@${host} with password "${pwd}"...`);
                    const connection = await mysql.createConnection({
                        host,
                        user,
                        password: pwd,
                    });
                    console.log(`✅ SUCCESS: Connected as ${user}@${host} with password ${pwd}`);
                    await connection.end();
                    return;
                } catch (err) {
                    // console.log(`❌ Failed: ${err.message}`);
                }
            }
        }
    }
}

probe();
