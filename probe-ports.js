const mysql = require('mysql2/promise');

async function probe() {
    const ports = [3306, 3307, 3308, 8889];
    const host = 'localhost';
    const user = 'root';
    const pwd = '0007';

    for (const port of ports) {
        try {
            console.log(`Probing root@${host}:${port}...`);
            const connection = await mysql.createConnection({
                host,
                port,
                user,
                password: pwd,
            });
            console.log(`✅ SUCCESS: Connected at port ${port}`);
            await connection.end();
            return;
        } catch (err) {
            console.log(`❌ Failed on port ${port}: ${err.message}`);
        }
    }
}

probe();
