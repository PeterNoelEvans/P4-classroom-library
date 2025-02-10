require('dotenv').config();

function checkAdminPassword() {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    console.log('\nAdmin Password Configuration:');
    console.log('---------------------------');
    console.log('Current admin password:', adminPassword);
    console.log('\nTo login as admin:');
    console.log('1. Go to: http://localhost:4000/admin-login.html');
    console.log('2. Enter password:', adminPassword);
    console.log('\nOr use the gear icon (⚙️) in the bottom right of the login page');
}

checkAdminPassword(); 