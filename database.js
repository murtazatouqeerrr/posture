const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use in-memory database for Vercel
const dbPath = ':memory:';

// Initialize database
function initDatabase() {
    const db = new sqlite3.Database(dbPath);
    
    // Create basic tables
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'therapist', 'user')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Contacts table
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            primary_complaint TEXT,
            status TEXT DEFAULT 'Lead' CHECK(status IN ('Lead', 'Client', 'Past Client')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert demo admin user (password: admin123)
        const adminHash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.jjAXBfWMZmtUB8Z1fSOHSRG6zV8W';
        db.run(`INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES 
                ('admin', ?, 'System Administrator', 'admin')`, [adminHash]);

        // Insert demo contacts
        db.run(`INSERT OR IGNORE INTO contacts (first_name, last_name, email, phone, primary_complaint, status) VALUES 
                ('John', 'Smith', 'john@email.com', '555-0101', 'Lower back pain', 'Client'),
                ('Sarah', 'Wilson', 'sarah@email.com', '555-0102', 'Neck pain', 'Lead'),
                ('Mike', 'Brown', 'mike@email.com', '555-0103', 'Shoulder pain', 'Client')`);
    });
    
    return db;
}

// Connect to database
function connectDatabase() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error connecting to database:', err);
        } else {
            console.log('Connected to SQLite database');
        }
    });
}

module.exports = { initDatabase, connectDatabase };
