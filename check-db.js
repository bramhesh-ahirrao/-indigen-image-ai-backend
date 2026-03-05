require('dotenv').config();
const { Admin } = require('./models');

async function checkAdmins() {
    try {
        const admins = await Admin.findAll();
        console.log('Admins in DB:', JSON.stringify(admins, null, 2));
    } catch (error) {
        console.error('Error checking admins:', error);
    } finally {
        process.exit();
    }
}

checkAdmins();
