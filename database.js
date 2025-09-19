const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use in-memory database for Vercel
const dbPath = ':memory:';

// Initialize database
function initDatabase() {
    const db = new sqlite3.Database(dbPath);
    
    // Create all required tables
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
            referred_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (referred_by) REFERENCES contacts(id)
        )`);

        // Appointments table
        db.run(`CREATE TABLE IF NOT EXISTS appointments (
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
        )`);

        // Invoices table
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status TEXT DEFAULT 'Sent' CHECK(status IN ('Sent', 'Paid', 'Overdue')),
            due_date DATE,
            services_rendered TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        )`);

        // Treatment plans table
        db.run(`CREATE TABLE IF NOT EXISTS treatment_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            duration TEXT,
            price DECIMAL(10,2),
            template_content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert demo admin user (password: admin123)
        const adminHash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.jjAXBfWMZmtUB8Z1fSOHSRG6zV8W';
        db.run(`INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES 
                ('admin', ?, 'System Administrator', 'admin')`, [adminHash]);

        // Insert demo therapists
        db.run(`INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES 
                ('therapist1', ?, 'Dr. Sarah Johnson', 'therapist'),
                ('therapist2', ?, 'Dr. Mike Chen', 'therapist')`, [adminHash, adminHash]);

        // Insert demo contacts
        db.run(`INSERT OR IGNORE INTO contacts (first_name, last_name, email, phone, primary_complaint, status) VALUES 
                ('John', 'Smith', 'john@email.com', '555-0101', 'Lower back pain', 'Client'),
                ('Sarah', 'Wilson', 'sarah@email.com', '555-0102', 'Neck pain', 'Lead'),
                ('Mike', 'Brown', 'mike@email.com', '555-0103', 'Shoulder pain', 'Client')`);

        // Insert demo appointments
        db.run(`INSERT OR IGNORE INTO appointments (contact_id, date_time, type, notes, status, assigned_to) VALUES 
                (1, '2024-01-15 10:00:00', 'Initial Assessment', 'First consultation', 'Completed', 1),
                (2, '2024-01-20 14:00:00', 'Initial Assessment', 'New patient assessment', 'Scheduled', 2),
                (3, '2024-01-25 09:00:00', '1-on-1 Treatment', 'Treatment session', 'Completed', 1)`);

        // Insert demo invoices
        db.run(`INSERT OR IGNORE INTO invoices (contact_id, amount, status, due_date, services_rendered) VALUES 
                (1, 150.00, 'Paid', '2024-01-30', 'Initial Assessment'),
                (2, 120.00, 'Sent', '2024-02-05', '1-on-1 Treatment Session'),
                (3, 150.00, 'Paid', '2024-02-10', 'Initial Assessment'),
                (1, 120.00, 'Paid', '2024-03-15', '1-on-1 Treatment Session'),
                (3, 120.00, 'Paid', '2024-03-20', '1-on-1 Treatment Session')`);

        // Insert demo appointments
        db.run(`INSERT OR IGNORE INTO appointments (contact_id, date_time, type, notes, status, assigned_to) VALUES 
                (1, '2024-01-15 10:00:00', 'Initial Assessment', 'First consultation', 'Completed', 1),
                (2, '2024-01-20 14:00:00', 'Initial Assessment', 'New patient assessment', 'Scheduled', 2),
                (3, '2024-01-25 09:00:00', '1-on-1 Treatment', 'Treatment session', 'Completed', 1),
                (1, '2024-02-15 10:00:00', '1-on-1 Treatment', 'Follow-up session', 'Completed', 1),
                (3, '2024-03-10 11:00:00', '1-on-1 Treatment', 'Progress session', 'Completed', 2)`);

        // Insert demo treatment plans
        db.run(`INSERT OR IGNORE INTO treatment_plans (name, description, duration, price, template_content) VALUES 
                ('6-Week Posture Correction Plan', 'Comprehensive posture correction program', '6 weeks', 299.99, 'Week 1-2: Assessment and basic exercises\nWeek 3-4: Strengthening routines\nWeek 5-6: Advanced corrections and maintenance'),
                ('1-on-1 Online Coaching Package', 'Personal coaching sessions', '4 weeks', 199.99, '4 weekly 1-hour sessions\nPersonalized exercise plan\n24/7 support via messaging'),
                ('Back Pain Relief Program', 'Specialized program for back pain', '8 weeks', 399.99, 'Week 1-2: Pain assessment\nWeek 3-6: Treatment protocols\nWeek 7-8: Maintenance and prevention')`);

        // Patient logins table
        db.run(`CREATE TABLE IF NOT EXISTS patient_logins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        )`);

        // Insert sample patient login
        db.run(`INSERT OR IGNORE INTO patient_logins (contact_id, email, password_hash) VALUES 
            (100, 'emily.johnson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')`);

        // Subscription Plans table
        db.run(`CREATE TABLE IF NOT EXISTS subscription_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            billing_interval TEXT NOT NULL,
            sessions_included INTEGER DEFAULT 0,
            stripe_price_id TEXT,
            active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Customer Subscriptions table
        db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
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
        )`);

        // Campaigns Table
        db.run(`CREATE TABLE IF NOT EXISTS campaigns (
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
        )`);

        // Automated Messages Table
        db.run(`CREATE TABLE IF NOT EXISTS automated_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER NOT NULL,
            subject TEXT,
            body TEXT NOT NULL,
            delay_days INTEGER DEFAULT 0,
            sequence_order INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
        )`);

        // Patient Assessments table
        db.run(`CREATE TABLE IF NOT EXISTS patient_assessments (
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
        )`);

        // Patient Sessions table
        db.run(`CREATE TABLE IF NOT EXISTS patient_sessions (
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
        )`);

        // Insert sample subscription plans
        db.run(`INSERT OR IGNORE INTO subscription_plans (name, description, price, billing_interval, sessions_included) VALUES 
            ('Weekly Session Plan', 'One session per week with ongoing support', 120.00, 'week', 1),
            ('Bi-Weekly Plan', 'Two sessions per week for intensive recovery', 220.00, 'week', 2),
            ('Monthly Maintenance', 'Monthly check-in and maintenance session', 100.00, 'month', 1),
            ('Premium Monthly', 'Unlimited sessions with premium care', 400.00, 'month', 0)`);

        // Insert sample campaigns
        db.run(`INSERT OR IGNORE INTO campaigns (name, description, target_audience, channel, status) VALUES 
            ('Welcome Series', 'Welcome new leads to our practice', 'leads', 'email', 'active'),
            ('Monthly Newsletter', 'Monthly health tips for clients', 'clients', 'email', 'active')`);
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
