const { exec } = require('child_process');
const fs = require('fs');

// Delete existing database and restart server to recreate with all tables
if (fs.existsSync('./crm.db')) {
    fs.unlinkSync('./crm.db');
    console.log('✅ Removed old database');
}

console.log('🔄 Restarting server to recreate database with all tables...');
console.log('📋 Patient login will be: emily.johnson@email.com / password');
console.log('🔐 Admin login: admin / password');
console.log('');
console.log('🚀 Run: npm run dev');
