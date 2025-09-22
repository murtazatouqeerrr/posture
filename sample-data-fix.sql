-- Add sample subscription plans
INSERT OR IGNORE INTO subscription_plans (id, name, description, price, billing_interval, features) VALUES
(1, 'Weekly Session Plan', 'Weekly physical therapy sessions with personalized treatment', 120.00, 'weekly', 'Weekly sessions, Progress tracking, Exercise plans'),
(2, 'Bi-Weekly Plan', 'Bi-weekly sessions for ongoing maintenance', 220.00, 'bi-weekly', 'Bi-weekly sessions, Progress tracking, Home exercises'),
(3, 'Monthly Maintenance', 'Monthly check-ups and maintenance sessions', 100.00, 'monthly', 'Monthly sessions, Assessment updates, Exercise modifications'),
(4, 'Intensive Program', 'Intensive 4-week rehabilitation program', 400.00, 'monthly', 'Daily sessions, Comprehensive assessment, Recovery plan');

-- Add sample subscriptions
INSERT OR IGNORE INTO subscriptions (id, contact_id, plan_id, status, start_date, end_date) VALUES
(1, 1, 1, 'active', '2024-01-01', '2024-12-31'),
(2, 2, 2, 'active', '2024-02-01', '2024-12-31'),
(3, 3, 3, 'active', '2024-03-01', '2024-12-31'),
(4, 4, 4, 'cancelled', '2024-01-15', '2024-06-15');

-- Add sample templates
INSERT OR IGNORE INTO templates (id, name, type, subject, content, variables) VALUES
(1, 'Welcome Email', 'EMAIL', 'Welcome to Posture Perfect!', 'Dear {{patient_name}}, welcome to our clinic! Your first appointment is scheduled for {{appointment_date}}.', '["patient_name", "appointment_date"]'),
(2, 'Appointment Reminder', 'EMAIL', 'Appointment Reminder', 'Hi {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}}.', '["patient_name", "appointment_date", "appointment_time"]'),
(3, 'Treatment Plan', 'DOCUMENT', 'Treatment Plan for {{patient_name}}', 'Treatment plan for {{patient_name}} - Diagnosis: {{diagnosis}}, Sessions: {{session_count}}, Duration: {{duration}} weeks', '["patient_name", "diagnosis", "session_count", "duration"]'),
(4, 'Invoice Template', 'DOCUMENT', 'Invoice {{invoice_number}}', 'Invoice for {{patient_name}} - Amount: ${{amount}}, Due: {{due_date}}, Services: {{services}}', '["patient_name", "invoice_number", "amount", "due_date", "services"]'),
(5, 'SMS Reminder', 'SMS', '', 'Hi {{patient_name}}, appointment reminder for {{time}}', '["patient_name", "time"]'),
(6, 'Follow-up Email', 'EMAIL', 'How are you feeling?', 'Hi {{patient_name}}, how are you feeling after your last session on {{last_session_date}}?', '["patient_name", "last_session_date"]'),
(7, 'Payment Reminder', 'EMAIL', 'Payment Due', 'Dear {{patient_name}}, your payment of ${{amount}} is due on {{due_date}}.', '["patient_name", "amount", "due_date"]'),
(8, 'Exercise Plan', 'DOCUMENT', 'Home Exercise Plan', 'Exercise plan for {{patient_name}} - {{exercise_count}} exercises for {{condition}}', '["patient_name", "exercise_count", "condition"]'),
(9, 'Discharge Summary', 'DOCUMENT', 'Discharge Summary', 'Discharge summary for {{patient_name}} - Treatment completed on {{completion_date}}', '["patient_name", "completion_date"]'),
(10, 'Referral Letter', 'DOCUMENT', 'Referral for {{patient_name}}', 'Referral letter for {{patient_name}} to {{specialist}} for {{condition}}', '["patient_name", "specialist", "condition"]');
