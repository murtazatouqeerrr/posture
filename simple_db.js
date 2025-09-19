const Database = require('better-sqlite3');

const db = new Database('./crm.db');

// Create tables and insert data
db.exec(`
    CREATE TABLE IF NOT EXISTS patient_logins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        primary_complaint TEXT,
        status TEXT DEFAULT 'Lead',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    INSERT OR IGNORE INTO contacts (id, first_name, last_name, email, phone, primary_complaint, status) VALUES 
        (100, 'Emily', 'Johnson', 'emily.johnson@email.com', '555-0199', 'Chronic lower back pain', 'Client');
    
    INSERT OR IGNORE INTO patient_logins (contact_id, email, password_hash) VALUES 
        (100, 'emily.johnson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
`);

console.log('✅ Database created with patient_logins table');
console.log('📋 Patient login: emily.johnson@email.com / password');

db.close();
