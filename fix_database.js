const fs = require('fs');
const path = require('path');

// Read the database.js file and add the missing table creation
const dbFile = './database.js';
let content = fs.readFileSync(dbFile, 'utf8');

// Check if patient_logins table creation already exists
if (!content.includes('CREATE TABLE IF NOT EXISTS patient_logins')) {
    // Find where to insert the table creation (after contacts table)
    const insertPoint = content.indexOf('// Appointments table');
    
    if (insertPoint !== -1) {
        const tableCreation = `
        // Patient logins table
        db.run(\`CREATE TABLE IF NOT EXISTS patient_logins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        )\`);

        `;
        
        content = content.slice(0, insertPoint) + tableCreation + content.slice(insertPoint);
        fs.writeFileSync(dbFile, content);
        console.log('✅ Added patient_logins table to database.js');
    }
}

console.log('🔧 Database fix completed!');
console.log('📋 Patient login credentials:');
console.log('   Email: emily.johnson@email.com');
console.log('   Password: password');
console.log('');
console.log('🚀 Restart your server: npm run dev');
