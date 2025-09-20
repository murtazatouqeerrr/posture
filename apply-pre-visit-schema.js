const { initDatabase } = require('./database.js');

const db = initDatabase();

const schemas = [
    `ALTER TABLE contacts ADD COLUMN pre_visit_status TEXT DEFAULT '{"intake_forms_sent": false, "intake_forms_completed": false, "cc_on_file": false, "first_appointment_scheduled": false}'`,
    
    `CREATE TABLE IF NOT EXISTS onboarding_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        task_type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        notes TEXT,
        FOREIGN KEY (patient_id) REFERENCES contacts(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS automated_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        email_type TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'sent',
        email_content TEXT,
        FOREIGN KEY (patient_id) REFERENCES contacts(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS intake_forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        form_data TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INTEGER,
        reviewed_at DATETIME,
        FOREIGN KEY (patient_id) REFERENCES contacts(id)
    )`
];

schemas.forEach((schema, index) => {
    db.run(schema, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error(`Error applying schema ${index + 1}:`, err.message);
        } else {
            console.log(`Schema ${index + 1} applied successfully`);
        }
    });
});

console.log('Pre-visit automation schema applied');
process.exit(0);
