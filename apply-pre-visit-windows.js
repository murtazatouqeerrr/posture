const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new Database(dbPath);

try {
    // Add pre_visit_status column to contacts table
    try {
        db.exec(`ALTER TABLE contacts ADD COLUMN pre_visit_status TEXT DEFAULT '{"intake_forms_sent": false, "intake_forms_completed": false, "cc_on_file": false, "first_appointment_scheduled": false}'`);
        console.log('Added pre_visit_status column to contacts table');
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Error adding pre_visit_status column:', err.message);
        }
    }

    // Create onboarding_tasks table
    db.exec(`
        CREATE TABLE IF NOT EXISTS onboarding_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            task_type TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES contacts(id)
        )
    `);
    console.log('Created onboarding_tasks table');

    // Create automated_emails table
    db.exec(`
        CREATE TABLE IF NOT EXISTS automated_emails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            email_type TEXT NOT NULL,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'sent',
            email_content TEXT,
            FOREIGN KEY (patient_id) REFERENCES contacts(id)
        )
    `);
    console.log('Created automated_emails table');

    // Create intake_forms table
    db.exec(`
        CREATE TABLE IF NOT EXISTS intake_forms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            form_data TEXT,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            reviewed_by INTEGER,
            reviewed_at DATETIME,
            FOREIGN KEY (patient_id) REFERENCES contacts(id)
        )
    `);
    console.log('Created intake_forms table');

    console.log('Pre-visit automation schema applied successfully');
} catch (error) {
    console.error('Error applying schema:', error.message);
} finally {
    db.close();
}
