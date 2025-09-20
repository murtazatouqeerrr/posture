const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./crm.db');

db.serialize(() => {
    // Create patient_logins table
    db.run(`CREATE TABLE IF NOT EXISTS patient_logins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating patient_logins:', err);
        else console.log('✅ patient_logins table created');
    });

    // Insert sample patient login
    db.run(`INSERT OR IGNORE INTO patient_logins (contact_id, email, password_hash) VALUES 
        (100, 'emily.johnson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')`, 
        (err) => {
            if (err) console.error('Error inserting patient login:', err);
            else console.log('✅ Sample patient login added');
        });
});

db.close((err) => {
    if (err) console.error('Error closing database:', err);
    else console.log('✅ Database setup complete');
});
