-- Insert default admin user (password: admin123) - will be fixed by fix-admin.js
INSERT OR REPLACE INTO users (id, username, password_hash, name, role, created_at) VALUES 
(1, 'admin', 'temp_hash', 'System Administrator', 'admin', datetime('now'));

-- Insert dummy therapist users
INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES 
('therapist1', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.jjAXBfWMZmtUB8Z1fSOHSRG6zV8W', 'Dr. Sarah Johnson', 'therapist'),
('therapist2', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.jjAXBfWMZmtUB8Z1fSOHSRG6zV8W', 'Dr. Mike Chen', 'therapist');

-- Insert dummy contacts/patients
INSERT OR IGNORE INTO contacts (first_name, last_name, email, phone, primary_complaint, status) VALUES 
('John', 'Smith', 'john.smith@email.com', '555-0101', 'Lower back pain', 'Client'),
('Sarah', 'Wilson', 'sarah.wilson@email.com', '555-0102', 'Neck pain', 'Lead'),
('Mike', 'Brown', 'mike.brown@email.com', '555-0103', 'Shoulder pain', 'Client'),
('Lisa', 'Davis', 'lisa.davis@email.com', '555-0104', 'Hip pain', 'Past Client'),
('Tom', 'Miller', 'tom.miller@email.com', '555-0105', 'Knee pain', 'Lead');

-- Insert dummy appointments
INSERT OR IGNORE INTO appointments (contact_id, date_time, type, notes, status) VALUES 
(1, '2024-01-15 10:00:00', 'Initial Assessment', 'First consultation', 'Completed'),
(1, '2024-01-22 10:00:00', '1-on-1 Treatment', 'Follow-up session', 'Completed'),
(2, '2024-01-20 14:00:00', 'Initial Assessment', 'New patient assessment', 'Scheduled'),
(3, '2024-01-25 09:00:00', '1-on-1 Treatment', 'Treatment session', 'Completed');

-- Insert dummy invoices
INSERT OR IGNORE INTO invoices (contact_id, amount, status, due_date, services_rendered) VALUES 
(1, 150.00, 'Paid', '2024-01-30', 'Initial Assessment'),
(1, 120.00, 'Paid', '2024-02-05', '1-on-1 Treatment Session'),
(3, 150.00, 'Sent', '2024-02-10', 'Initial Assessment'),
(4, 120.00, 'Paid', '2024-01-20', 'Treatment Session');

-- Insert dummy patient assessments
INSERT OR IGNORE INTO patient_assessments (patient_id, assessment_date, therapist_notes, observed_posture, recommendations) VALUES 
(1, '2024-01-15 10:00:00', 'Patient reports chronic lower back pain for 6 months', 'Forward head posture, rounded shoulders', 'Strengthen core, improve posture awareness'),
(3, '2024-01-25 09:00:00', 'Shoulder impingement symptoms', 'Limited shoulder mobility, muscle tension', 'Shoulder mobility exercises, posture correction');

-- Insert dummy patient sessions
INSERT OR IGNORE INTO patient_sessions (patient_id, session_date, type, notes, pain_level_pre, pain_level_post, homework_assigned) VALUES 
(1, '2024-01-22 10:00:00', '1-on-1 Treatment', 'Worked on core strengthening and posture', 7, 4, 'Daily core exercises, posture breaks every hour'),
(3, '2024-02-01 09:00:00', 'Follow-up', 'Shoulder mobility improvements noted', 6, 3, 'Continue shoulder exercises, ice after activity');
