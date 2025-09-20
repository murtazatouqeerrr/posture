-- Add sample invoices
INSERT INTO invoices (contact_id, service_description, amount, invoice_date, due_date, status) VALUES
(1, 'Initial Consultation and Assessment', 150.00, '2024-01-01', '2024-01-15', 'Paid'),
(2, 'Monthly Treatment Package', 200.00, '2024-01-15', '2024-02-15', 'Sent'),
(3, 'Follow-up Session', 75.00, '2024-01-10', '2024-01-30', 'Overdue'),
(4, 'Comprehensive Treatment Plan', 300.00, '2024-01-20', '2024-02-01', 'Paid'),
(1, 'Posture Correction Session', 125.00, '2024-02-01', '2024-02-20', 'Sent');

-- Add sample campaigns
INSERT INTO campaigns (name, subject, content, target_audience, channel, status) VALUES
('New Patient Welcome', 'Welcome to Posture Perfect!', 'Welcome series for new patients with introduction to our services', 'new_patients', 'email', 'Active'),
('Monthly Health Tips', 'Monthly Health Newsletter', 'Monthly newsletter with health tips and posture advice', 'all_patients', 'email', 'Active'),
('Posture Assessment Reminder', 'Time for Your Assessment', 'Reminder for quarterly posture assessments', 'existing_patients', 'sms', 'Active'),
('Holiday Special Offer', 'Special Holiday Pricing', 'Special holiday pricing for treatments', 'all_patients', 'email', 'Completed'),
('Summer Wellness Program', 'Summer Wellness Program', 'Summer wellness and posture program', 'active_patients', 'email', 'Draft');

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Add sample templates
INSERT INTO templates (name, type, subject, content, variables) VALUES
('Welcome Email', 'email', 'Welcome to Posture Perfect!', 'Dear [patient_name], Welcome to Posture Perfect! We are excited to help you on your journey to better posture and health.', 'patient_name,appointment_date'),
('Appointment Reminder', 'email', 'Appointment Reminder - [appointment_date]', 'Hi [patient_name], This is a reminder of your upcoming appointment on [appointment_date] at [appointment_time].', 'patient_name,appointment_date,appointment_time'),
('Treatment Plan', 'document', 'Personalized Treatment Plan', 'Treatment Plan for [patient_name]\n\nDiagnosis: [diagnosis]\nRecommended Sessions: [session_count]\nExpected Duration: [duration]', 'patient_name,diagnosis,session_count,duration'),
('Invoice Template', 'document', 'Invoice #[invoice_number]', 'Invoice for [patient_name]\nAmount: $[amount]\nDue Date: [due_date]\nServices: [services]', 'patient_name,invoice_number,amount,due_date,services'),
('SMS Reminder', 'sms', '', 'Hi [patient_name], reminder: appointment tomorrow at [time]. Reply STOP to opt out.', 'patient_name,time');