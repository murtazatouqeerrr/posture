const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./crm.db');

async function fixAdminPassword() {
    try {
        // Hash the password properly
        const password = 'admin123';
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        console.log('Generated hash:', passwordHash);
        
        // Update or insert admin user
        const sql = `INSERT OR REPLACE INTO users (id, username, password_hash, name, role, created_at) 
                     VALUES (1, 'admin', ?, 'System Administrator', 'admin', datetime('now'))`;
        
        db.run(sql, [passwordHash], function(err) {
            if (err) {
                console.error('Error updating admin:', err);
            } else {
                console.log('Admin user updated successfully');
                console.log('Username: admin');
                console.log('Password: admin123');
            }
            db.close();
        });
        
    } catch (error) {
        console.error('Error:', error);
        db.close();
    }
}

fixAdminPassword();
