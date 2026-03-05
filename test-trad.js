const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0007'
});

connection.connect(function (err) {
    if (err) {
        console.error('❌ Connection error: ' + err.stack);
        return;
    }
    console.log('✅ Connected as id ' + connection.threadId);
    connection.end();
});
