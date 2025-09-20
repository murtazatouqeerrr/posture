-- Module 1: Pre-Visit Task Automation & CC on File
-- Database schema for tracking onboarding tasks

-- Add pre_visit_status JSON field to patients table
ALTER TABLE contacts ADD COLUMN pre_visit_status TEXT DEFAULT '{"intake_forms_sent": false, "intake_forms_completed": false, "cc_on_file": false, "first_appointment_scheduled": false}';

-- Create onboarding_tasks table for detailed tracking
CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    task_type TEXT NOT NULL, -- 'intake_forms_sent', 'intake_forms_completed', 'cc_on_file', 'first_appointment_scheduled'
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES contacts(id)
);

-- Create automated_emails table to track email communications
CREATE TABLE IF NOT EXISTS automated_emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    email_type TEXT NOT NULL, -- 'intake_forms', 'cc_reminder', 'appointment_confirmation'
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'failed'
    email_content TEXT,
    FOREIGN KEY (patient_id) REFERENCES contacts(id)
);

-- Create intake_forms table to store digital intake form responses
CREATE TABLE IF NOT EXISTS intake_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    form_data TEXT, -- JSON string containing form responses
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER, -- staff member who reviewed
    reviewed_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES contacts(id)
);
