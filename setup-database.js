const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Setting up database tables...');

db.serialize(() => {
    // Contacts table
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        primary_complaint TEXT,
        status TEXT DEFAULT 'Lead',
        referred_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Contacts table error:', err.message);
        else console.log('✅ Contacts table ready');
    });

    // Appointments table
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        date_time TEXT,
        type TEXT,
        notes TEXT,
        status TEXT DEFAULT 'Scheduled',
        assigned_to TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
    )`, (err) => {
        if (err) console.error('❌ Appointments table error:', err.message);
        else console.log('✅ Appointments table ready');
    });

    // Invoices table
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        amount REAL,
        description TEXT,
        status TEXT DEFAULT 'Sent',
        due_date TEXT,
        stripe_payment_intent_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
    )`, (err) => {
        if (err) console.error('❌ Invoices table error:', err.message);
        else console.log('✅ Invoices table ready');
    });

    // Treatment plans table
    db.run(`CREATE TABLE IF NOT EXISTS treatment_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        duration INTEGER,
        price REAL,
        template_content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Treatment plans table error:', err.message);
        else console.log('✅ Treatment plans table ready');
    });

    // Campaigns table
    db.run(`CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        subject TEXT,
        content TEXT,
        target_audience TEXT,
        channel TEXT,
        status TEXT DEFAULT 'Draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Campaigns table error:', err.message);
        else console.log('✅ Campaigns table ready');
    });

    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Users table error:', err.message);
        else console.log('✅ Users table ready');
    });

    // Patient sessions table
    db.run(`CREATE TABLE IF NOT EXISTS patient_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        session_date TEXT,
        session_type TEXT,
        duration_minutes INTEGER,
        pre_session_pain INTEGER,
        post_session_pain INTEGER,
        treatments_performed TEXT,
        homework_assigned TEXT,
        therapist_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
    )`, (err) => {
        if (err) console.error('❌ Patient sessions table error:', err.message);
        else console.log('✅ Patient sessions table ready');
    });

    // Patient assessments table
    db.run(`CREATE TABLE IF NOT EXISTS patient_assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        assessment_date TEXT,
        therapist_notes TEXT,
        observed_posture TEXT,
        recommendations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
    )`, (err) => {
        if (err) console.error('❌ Patient assessments table error:', err.message);
        else console.log('✅ Patient assessments table ready');
    });

    // Packages table
    db.run(`CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        number_of_sessions INTEGER,
        price REAL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ Packages table error:', err.message);
        else console.log('✅ Packages table ready');
    });

    // Feedback requests table
    db.run(`CREATE TABLE IF NOT EXISTS feedback_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        request_date TEXT,
        status TEXT DEFAULT 'Sent',
        feedback_received TEXT,
        rating INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
    )`, (err) => {
        if (err) console.error('❌ Feedback requests table error:', err.message);
        else console.log('✅ Feedback requests table ready');
    });

    // Reviews table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        rating INTEGER,
        review_text TEXT,
        review_date TEXT,
        is_public INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
    )`, (err) => {
        if (err) console.error('❌ Reviews table error:', err.message);
        else console.log('✅ Reviews table ready');
    });

    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'Pending',
        priority TEXT DEFAULT 'Medium',
        assigned_to TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
    )`, (err) => {
        if (err) console.error('❌ Tasks table error:', err.message);
        else console.log('✅ Tasks table ready');
    });

    // Automated emails table
    db.run(`CREATE TABLE IF NOT EXISTS automated_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        email_type TEXT,
        sent_at TEXT,
        status TEXT DEFAULT 'sent',
        email_content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES contacts (id)
    )`, (err) => {
        if (err) console.error('❌ Automated emails table error:', err.message);
        else console.log('✅ Automated emails table ready');
    });

    setTimeout(() => {
        console.log('\n🎉 Database setup complete!');
        console.log('📋 All tables created successfully');
        console.log('🚀 You can now run: node insert-all-sample-data.js');
        db.close();
    }, 1000);
});
