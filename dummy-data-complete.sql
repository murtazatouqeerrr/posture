-- Comprehensive Dummy Data for All Modules

-- Clear existing data
DELETE FROM audit_log;
DELETE FROM patient_sessions;
DELETE FROM patient_assessments;
DELETE FROM subscriptions;
DELETE FROM payment_methods;
DELETE FROM invoices;
DELETE FROM appointments;
DELETE FROM contacts;
DELETE FROM users;
DELETE FROM treatment_plans;
DELETE FROM subscription_plans;

-- Insert Users
INSERT INTO users (id, username, email, password_hash, role, created_at) VALUES 
(1, 'admin', 'admin@postureperect.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '2024-01-01 10:00:00'),
(2, 'therapist1', 'sarah@postureperect.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'therapist', '2024-01-02 10:00:00'),
(3, 'therapist2', 'mike@postureperect.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'therapist', '2024-01-03 10:00:00'),
(4, 'receptionist', 'jenny@postureperect.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', '2024-01-04 10:00:00');

-- Insert Contacts/Patients
INSERT INTO contacts (id, first_name, last_name, email, phone, primary_complaint, status, stripe_customer_id, referred_by, created_at) VALUES 
(1, 'John', 'Smith', 'john.smith@email.com', '555-0101', 'Lower back pain from desk work', 'Client', 'cus_test_001', NULL, '2024-01-15 09:30:00'),
(2, 'Sarah', 'Wilson', 'sarah.wilson@email.com', '555-0102', 'Neck pain and headaches', 'Client', 'cus_test_002', NULL, '2024-01-16 10:15:00'),
(3, 'Mike', 'Brown', 'mike.brown@email.com', '555-0103', 'Shoulder impingement', 'Client', 'cus_test_003', 1, '2024-01-17 11:00:00'),
(4, 'Emily', 'Davis', 'emily.davis@email.com', '555-0104', 'Hip pain after running', 'Lead', NULL, NULL, '2024-01-18 14:30:00'),
(5, 'Robert', 'Johnson', 'robert.johnson@email.com', '555-0105', 'Knee pain post-surgery', 'Client', 'cus_test_004', 2, '2024-01-19 16:00:00'),
(6, 'Lisa', 'Anderson', 'lisa.anderson@email.com', '555-0106', 'Chronic back pain', 'Client', 'cus_test_005', NULL, '2024-01-20 08:45:00'),
(7, 'David', 'Martinez', 'david.martinez@email.com', '555-0107', 'Tennis elbow', 'Lead', NULL, NULL, '2024-01-21 13:20:00'),
(8, 'Jennifer', 'Taylor', 'jennifer.taylor@email.com', '555-0108', 'Posture correction', 'Client', 'cus_test_006', 3, '2024-01-22 15:10:00'),
(9, 'William', 'Thomas', 'william.thomas@email.com', '555-0109', 'Sciatica pain', 'Client', 'cus_test_007', NULL, '2024-01-23 09:00:00'),
(10, 'Amanda', 'White', 'amanda.white@email.com', '555-0110', 'Carpal tunnel syndrome', 'Lead', NULL, NULL, '2024-01-24 11:30:00');

-- Insert Treatment Plans
INSERT INTO treatment_plans (id, name, description, duration_weeks, sessions_per_week, price_per_session, created_at) VALUES 
(1, 'Basic Physical Therapy', 'Standard rehabilitation program for common injuries', 6, 2, 120.00, '2024-01-01 12:00:00'),
(2, 'Advanced Recovery Program', 'Intensive therapy for complex cases and post-surgical recovery', 8, 3, 150.00, '2024-01-01 12:00:00'),
(3, 'Maintenance Program', 'Ongoing support and prevention for long-term wellness', 4, 1, 80.00, '2024-01-01 12:00:00'),
(4, 'Sports Injury Recovery', 'Specialized treatment for athletic injuries', 10, 2, 140.00, '2024-01-01 12:00:00'),
(5, 'Posture Correction Program', 'Comprehensive posture improvement and ergonomic training', 12, 2, 110.00, '2024-01-01 12:00:00'),
(6, 'Pain Management Program', 'Chronic pain relief and management strategies', 8, 2, 130.00, '2024-01-01 12:00:00');

-- Insert Subscription Plans
INSERT INTO subscription_plans (id, name, description, price, billing_interval, sessions_included, stripe_price_id, active, created_at) VALUES 
(1, 'Weekly Session Plan', 'One session per week with ongoing support', 120.00, 'week', 1, 'price_test_weekly', 1, '2024-01-01 12:00:00'),
(2, 'Bi-Weekly Plan', 'Two sessions per week for intensive recovery', 220.00, 'week', 2, 'price_test_biweekly', 1, '2024-01-01 12:00:00'),
(3, 'Monthly Maintenance', 'Monthly check-in and maintenance session', 100.00, 'month', 1, 'price_test_monthly', 1, '2024-01-01 12:00:00'),
(4, 'Premium Monthly', 'Unlimited sessions with premium care', 400.00, 'month', 0, 'price_test_premium', 1, '2024-01-01 12:00:00');

-- Insert Appointments
INSERT INTO appointments (id, contact_id, appointment_date, appointment_time, service_type, notes, status, created_at) VALUES 
(1, 1, '2024-02-01', '09:00', 'Initial Assessment', 'First visit for lower back pain evaluation', 'Completed', '2024-01-25 10:00:00'),
(2, 1, '2024-02-03', '09:00', 'Physical Therapy', 'Follow-up session, good progress', 'Completed', '2024-01-25 10:01:00'),
(3, 2, '2024-02-01', '10:30', 'Initial Assessment', 'Neck pain assessment and treatment plan', 'Completed', '2024-01-25 10:02:00'),
(4, 3, '2024-02-02', '14:00', 'Physical Therapy', 'Shoulder mobility exercises', 'Completed', '2024-01-25 10:03:00'),
(5, 1, '2024-02-05', '09:00', 'Physical Therapy', 'Continuing back strengthening program', 'Scheduled', '2024-01-25 10:04:00'),
(6, 2, '2024-02-05', '10:30', 'Physical Therapy', 'Neck exercises and posture training', 'Scheduled', '2024-01-25 10:05:00'),
(7, 5, '2024-02-06', '15:00', 'Initial Assessment', 'Post-surgical knee evaluation', 'Scheduled', '2024-01-25 10:06:00'),
(8, 6, '2024-02-07', '08:30', 'Physical Therapy', 'Chronic back pain management', 'Scheduled', '2024-01-25 10:07:00'),
(9, 8, '2024-02-08', '16:00', 'Posture Assessment', 'Workplace ergonomic evaluation', 'Scheduled', '2024-01-25 10:08:00'),
(10, 9, '2024-02-09', '09:30', 'Physical Therapy', 'Sciatica pain relief session', 'Scheduled', '2024-01-25 10:09:00');

-- Insert Invoices
INSERT INTO invoices (id, contact_id, service_description, amount, invoice_date, due_date, status, stripe_payment_intent_id, stripe_invoice_id, payment_method, created_at) VALUES 
(1, 1, 'Initial Assessment - Lower Back Pain', 150.00, '2024-02-01', '2024-02-15', 'Paid', 'pi_test_001', 'in_test_001', 'stripe', '2024-02-01 10:00:00'),
(2, 1, 'Physical Therapy Session - Back Strengthening', 120.00, '2024-02-03', '2024-02-17', 'Paid', 'pi_test_002', 'in_test_002', 'stripe', '2024-02-03 10:00:00'),
(3, 2, 'Initial Assessment - Neck Pain', 150.00, '2024-02-01', '2024-02-15', 'Paid', 'pi_test_003', 'in_test_003', 'stripe', '2024-02-01 11:00:00'),
(4, 3, 'Physical Therapy Session - Shoulder Treatment', 120.00, '2024-02-02', '2024-02-16', 'Sent', NULL, NULL, NULL, '2024-02-02 15:00:00'),
(5, 5, 'Initial Assessment - Knee Post-Surgery', 150.00, '2024-02-06', '2024-02-20', 'Sent', NULL, NULL, NULL, '2024-02-06 16:00:00'),
(6, 6, 'Physical Therapy Session - Back Pain Management', 120.00, '2024-02-07', '2024-02-21', 'Overdue', NULL, NULL, NULL, '2024-02-07 09:00:00'),
(7, 8, 'Posture Assessment and Correction Plan', 180.00, '2024-02-08', '2024-02-22', 'Sent', NULL, NULL, NULL, '2024-02-08 17:00:00'),
(8, 9, 'Physical Therapy Session - Sciatica Treatment', 120.00, '2024-02-09', '2024-02-23', 'Sent', NULL, NULL, NULL, '2024-02-09 10:00:00');

-- Insert Patient Assessments
INSERT INTO patient_assessments (id, contact_id, assessment_date, chief_complaint, pain_level, functional_goals, medical_history, current_medications, therapist_notes, created_at) VALUES 
(1, 1, '2024-02-01', 'Lower back pain from prolonged sitting at desk job', 7, 'Return to pain-free sitting and improve posture', 'No previous back injuries, sedentary lifestyle', 'Ibuprofen as needed', 'Patient shows good motivation, mild muscle tension in lumbar region', '2024-02-01 09:30:00'),
(2, 2, '2024-02-01', 'Neck pain and frequent headaches', 6, 'Reduce headache frequency and improve neck mobility', 'History of whiplash 2 years ago', 'None', 'Limited cervical rotation, forward head posture noted', '2024-02-01 10:45:00'),
(3, 3, '2024-02-02', 'Right shoulder impingement affecting daily activities', 5, 'Full shoulder range of motion for overhead activities', 'Previous rotator cuff strain', 'None', 'Positive impingement signs, weakness in external rotation', '2024-02-02 14:15:00'),
(4, 5, '2024-02-06', 'Knee pain and stiffness following ACL reconstruction', 4, 'Return to running and sports activities', 'ACL surgery 3 months ago', 'None', 'Good surgical healing, mild swelling, limited flexion', '2024-02-06 15:15:00'),
(5, 6, '2024-02-07', 'Chronic lower back pain for 2+ years', 8, 'Manage daily pain and improve quality of life', 'Herniated disc L4-L5, previous PT', 'Gabapentin, muscle relaxers', 'Chronic pain pattern, guarded movement, depression screening needed', '2024-02-07 08:45:00');

-- Insert Patient Sessions
INSERT INTO patient_sessions (id, contact_id, session_date, session_type, duration_minutes, pre_session_pain, post_session_pain, treatments_performed, homework_assigned, therapist_notes, next_session_goals, created_at) VALUES 
(1, 1, '2024-02-03', 'Physical Therapy', 60, 6, 3, 'Manual therapy, core strengthening, posture education', 'Daily walks, ergonomic setup review', 'Good response to treatment, patient motivated', 'Continue core program, add hip flexor stretches', '2024-02-03 10:00:00'),
(2, 2, '2024-02-05', 'Physical Therapy', 45, 5, 2, 'Cervical mobilization, strengthening exercises', 'Neck stretches 3x daily, posture breaks', 'Significant improvement in range of motion', 'Progress to resistance exercises', '2024-02-05 11:00:00'),
(3, 3, '2024-02-04', 'Physical Therapy', 60, 4, 2, 'Shoulder mobilization, rotator cuff strengthening', 'Theraband exercises, ice after activity', 'Good progress, less impingement pain', 'Increase resistance, add functional movements', '2024-02-04 14:30:00'),
(4, 1, '2024-02-08', 'Physical Therapy', 60, 4, 2, 'Advanced core exercises, functional training', 'Continue home program, ergonomic assessment', 'Excellent progress, ready for discharge planning', 'Final session next week, home program review', '2024-02-08 09:15:00'),
(5, 5, '2024-02-10', 'Physical Therapy', 60, 3, 1, 'Knee strengthening, balance training, gait analysis', 'Quad sets, balance exercises, walking program', 'Great progress, minimal swelling', 'Progress to jogging preparation', '2024-02-10 15:30:00');

-- Insert Payment Methods
INSERT INTO payment_methods (id, contact_id, stripe_payment_method_id, type, last_four, brand, exp_month, exp_year, is_default, created_at) VALUES 
(1, 1, 'pm_test_001', 'card', '4242', 'visa', 12, 2025, 1, '2024-02-01 10:00:00'),
(2, 2, 'pm_test_002', 'card', '4000', 'visa', 10, 2026, 1, '2024-02-01 11:00:00'),
(3, 3, 'pm_test_003', 'card', '5555', 'mastercard', 8, 2025, 1, '2024-02-02 15:00:00'),
(4, 6, 'pm_test_004', 'card', '3782', 'amex', 6, 2027, 1, '2024-02-07 09:00:00'),
(5, 8, 'pm_test_005', 'card', '4242', 'visa', 4, 2026, 1, '2024-02-08 17:00:00');

-- Insert Subscriptions
INSERT INTO subscriptions (id, contact_id, plan_id, stripe_subscription_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at) VALUES 
(1, 1, 1, 'sub_test_001', 'active', '2024-02-01', '2024-02-08', 0, '2024-02-01 10:30:00'),
(2, 2, 2, 'sub_test_002', 'active', '2024-02-01', '2024-02-08', 0, '2024-02-01 11:30:00'),
(3, 6, 3, 'sub_test_003', 'active', '2024-02-07', '2024-03-07', 0, '2024-02-07 09:30:00'),
(4, 8, 1, 'sub_test_004', 'active', '2024-02-08', '2024-02-15', 0, '2024-02-08 17:30:00');

-- Insert Audit Log entries
INSERT INTO audit_log (id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at) VALUES 
(1, 1, 'CREATE', 'contacts', 1, NULL, '{"first_name":"John","last_name":"Smith","email":"john.smith@email.com"}', '127.0.0.1', 'Mozilla/5.0', '2024-01-15 09:30:00'),
(2, 1, 'CREATE', 'appointments', 1, NULL, '{"contact_id":1,"appointment_date":"2024-02-01","service_type":"Initial Assessment"}', '127.0.0.1', 'Mozilla/5.0', '2024-01-25 10:00:00'),
(3, 2, 'UPDATE', 'appointments', 1, '{"status":"Scheduled"}', '{"status":"Completed"}', '127.0.0.1', 'Mozilla/5.0', '2024-02-01 10:00:00'),
(4, 1, 'CREATE', 'invoices', 1, NULL, '{"contact_id":1,"amount":150.00,"service_description":"Initial Assessment"}', '127.0.0.1', 'Mozilla/5.0', '2024-02-01 10:00:00'),
(5, 1, 'CREATE', 'patient_assessments', 1, NULL, '{"contact_id":1,"pain_level":7,"chief_complaint":"Lower back pain"}', '127.0.0.1', 'Mozilla/5.0', '2024-02-01 09:30:00');
