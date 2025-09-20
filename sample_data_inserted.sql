
-- Sample Patient Data
INSERT OR REPLACE INTO contacts (id, first_name, last_name, email, phone, primary_complaint, status) 
VALUES (100, 'Emily', 'Johnson', 'emily.johnson@email.com', '555-0199', 'Chronic lower back pain and sciatica', 'Client');

INSERT OR REPLACE INTO patient_assessments (contact_id, assessment_date, chief_complaint, pain_level, functional_goals, medical_history, current_medications, therapist_notes)
VALUES (100, '2024-01-15', 'Chronic lower back pain radiating to left leg, started 6 months ago after lifting heavy box', 7, 'Return to work without pain, ability to sit for 2+ hours, resume jogging', 'No previous back injuries, occasional headaches, no surgeries', 'Ibuprofen 400mg as needed, Multivitamin', 'Patient presents with limited lumbar flexion, positive straight leg raise test on left. Recommending 2x/week sessions for 8 weeks.');

INSERT OR REPLACE INTO patient_sessions (contact_id, session_date, session_type, duration_minutes, pre_session_pain, post_session_pain, treatments_performed, homework_assigned, therapist_notes, next_session_goals)
VALUES 
(100, '2024-01-18', 'Initial Treatment', 60, 7, 5, 'Manual therapy, lumbar mobilization, core strengthening exercises', 'Pelvic tilts 2x10, walking 15 minutes daily, ice 15 minutes after activity', 'Good response to manual therapy. Patient motivated and compliant.', 'Continue mobilization, progress core exercises'),
(100, '2024-01-22', 'Follow-up Treatment', 45, 6, 4, 'Spinal manipulation, therapeutic exercises, heat therapy', 'Bridge exercises 2x15, cat-cow stretches, continue walking program', 'Improved range of motion. Pain decreasing. Patient reports better sleep.', 'Add functional movements, assess work ergonomics');

INSERT OR REPLACE INTO appointments (contact_id, appointment_date, appointment_time, service_type, notes, status)
VALUES (100, '2024-01-25', '14:00', 'Physical Therapy Session', 'Continue current treatment plan, assess progress', 'Scheduled');

INSERT OR REPLACE INTO invoices (contact_id, service_description, amount, invoice_date, due_date, status, payment_method)
VALUES (100, 'Physical Therapy Session - Initial Assessment and Treatment', 150.00, '2024-01-18', '2024-02-18', 'Paid', 'Credit Card');
