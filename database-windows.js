const Database = require('better-sqlite3');
const path = require('path');

// Use file-based database for Windows
const dbPath = path.join(__dirname, 'crm.db');

// Initialize database
function initDatabase() {
    const db = new Database(dbPath);
    
    // Create all required tables
    db.exec(`
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'therapist', 'user')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Contacts table
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            primary_complaint TEXT,
            status TEXT DEFAULT 'Lead' CHECK(status IN ('Lead', 'Client', 'Past Client')),
            referred_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (referred_by) REFERENCES contacts(id)
        );

        -- Appointments table
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            date_time DATETIME NOT NULL,
            type TEXT NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'Scheduled' CHECK(status IN ('Scheduled', 'Completed', 'Cancelled')),
            assigned_to INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id),
            FOREIGN KEY (assigned_to) REFERENCES users(id)
        );

        -- Invoices table
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status TEXT DEFAULT 'Sent' CHECK(status IN ('Sent', 'Paid', 'Overdue')),
            due_date DATE,
            services_rendered TEXT,
            stripe_payment_intent_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        );

        -- Treatment plans table
        CREATE TABLE IF NOT EXISTS treatment_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            duration TEXT,
            price DECIMAL(10,2),
            template_content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Subscription Plans table
        CREATE TABLE IF NOT EXISTS subscription_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            billing_interval TEXT NOT NULL,
            sessions_included INTEGER DEFAULT 0,
            stripe_price_id TEXT,
            active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Customer Subscriptions table
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            stripe_subscription_id TEXT,
            status TEXT DEFAULT 'active',
            current_period_start DATE,
            current_period_end DATE,
            cancel_at_period_end BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id),
            FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
        );

        -- Campaigns Table
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            target_audience TEXT NOT NULL,
            channel TEXT NOT NULL,
            status TEXT DEFAULT 'draft',
            schedule_type TEXT,
            day_of_week INTEGER,
            day_of_month INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Automated Messages Table
        CREATE TABLE IF NOT EXISTS automated_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER NOT NULL,
            subject TEXT,
            body TEXT NOT NULL,
            delay_days INTEGER DEFAULT 0,
            sequence_order INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
        );

        -- Patient Assessments table
        CREATE TABLE IF NOT EXISTS patient_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            assessment_date DATE NOT NULL,
            chief_complaint TEXT,
            pain_level INTEGER CHECK(pain_level >= 0 AND pain_level <= 10),
            functional_goals TEXT,
            medical_history TEXT,
            current_medications TEXT,
            therapist_notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        );

        -- Patient Sessions table
        CREATE TABLE IF NOT EXISTS patient_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            session_date DATE NOT NULL,
            session_type TEXT NOT NULL,
            duration_minutes INTEGER DEFAULT 60,
            pre_session_pain INTEGER CHECK(pre_session_pain >= 0 AND pre_session_pain <= 10),
            post_session_pain INTEGER CHECK(post_session_pain >= 0 AND post_session_pain <= 10),
            treatments_performed TEXT,
            homework_assigned TEXT,
            therapist_notes TEXT,
            next_session_goals TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        );

        -- Patient logins table
        CREATE TABLE IF NOT EXISTS patient_logins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        );
    `);

    // Insert demo data
    const adminHash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.jjAXBfWMZmtUB8Z1fSOHSRG6zV8W';
    
    const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)');
    insertUser.run('admin', adminHash, 'System Administrator', 'admin');
    insertUser.run('therapist1', adminHash, 'Dr. Sarah Johnson', 'therapist');
    insertUser.run('therapist2', adminHash, 'Dr. Mike Chen', 'therapist');

    const insertContact = db.prepare('INSERT OR IGNORE INTO contacts (first_name, last_name, email, phone, primary_complaint, status) VALUES (?, ?, ?, ?, ?, ?)');
    insertContact.run('John', 'Smith', 'john@email.com', '555-0101', 'Lower back pain', 'Client');
    insertContact.run('Sarah', 'Wilson', 'sarah@email.com', '555-0102', 'Neck pain', 'Lead');
    insertContact.run('Mike', 'Brown', 'mike@email.com', '555-0103', 'Shoulder pain', 'Client');

    const insertPlan = db.prepare('INSERT OR IGNORE INTO subscription_plans (name, description, price, billing_interval, sessions_included) VALUES (?, ?, ?, ?, ?)');
    insertPlan.run('Weekly Session Plan', 'One session per week with ongoing support', 120.00, 'week', 1);
    insertPlan.run('Bi-Weekly Plan', 'Two sessions per week for intensive recovery', 220.00, 'week', 2);
    insertPlan.run('Monthly Maintenance', 'Monthly check-in and maintenance session', 100.00, 'month', 1);
    insertPlan.run('Premium Monthly', 'Unlimited sessions with premium care', 400.00, 'month', 0);

    const insertCampaign = db.prepare('INSERT OR IGNORE INTO campaigns (name, description, target_audience, channel, status) VALUES (?, ?, ?, ?, ?)');
    insertCampaign.run('Welcome Series', 'Welcome new leads to our practice', 'leads', 'email', 'active');
    insertCampaign.run('Monthly Newsletter', 'Monthly health tips for clients', 'clients', 'email', 'active');
    
    return db;
}

module.exports = { initDatabase };
