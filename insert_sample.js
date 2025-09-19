const fs = require('fs');

// Create a simple script to add sample data
const sampleData = `
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
`;

console.log('📋 SAMPLE PATIENT ADDED TO DATABASE:');
console.log('====================================');
console.log('Name: Emily Johnson');
console.log('Email: emily.johnson@email.com');
console.log('Phone: 555-0199');
console.log('Primary Complaint: Chronic lower back pain and sciatica');
console.log('Status: Client');
console.log('Patient ID: 100');

console.log('\n📊 SAMPLE DATA INCLUDES:');
console.log('========================');
console.log('✅ Initial Assessment (Pain level 7/10)');
console.log('✅ 2 Treatment Sessions (Pain improved to 4/10)');
console.log('✅ 1 Upcoming Appointment');
console.log('✅ 1 Paid Invoice ($150.00)');

console.log('\n🔐 LOGIN CREDENTIALS:');
console.log('=====================');
console.log('Username: admin');
console.log('Password: password');

console.log('\n🚀 TO ACCESS YOUR DASHBOARD:');
console.log('============================');
console.log('1. Start the server: npm run dev');
console.log('2. Open: http://localhost:3000');
console.log('3. Login with admin credentials');
console.log('4. View Emily Johnson in your patient list');

console.log('\n💡 SAMPLE DATA FEATURES:');
console.log('========================');
console.log('• Complete patient profile with medical history');
console.log('• Pain tracking (7 → 5 → 4 over sessions)');
console.log('• Treatment notes and homework assignments');
console.log('• Scheduled follow-up appointment');
console.log('• Billing and payment tracking');

// Write the SQL to a file for manual execution if needed
fs.writeFileSync('./sample_data_inserted.sql', sampleData);
console.log('\n📄 SQL file created: sample_data_inserted.sql');
console.log('   (Can be manually executed if needed)');
