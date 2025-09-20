const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Inserting comprehensive sample data...');

db.serialize(() => {
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    db.run('DELETE FROM contacts');
    db.run('DELETE FROM appointments');
    db.run('DELETE FROM invoices');
    db.run('DELETE FROM treatment_plans');
    db.run('DELETE FROM campaigns');
    db.run('DELETE FROM packages');
    db.run('DELETE FROM feedback_requests');
    db.run('DELETE FROM reviews');
    db.run('DELETE FROM patient_sessions');
    db.run('DELETE FROM patient_assessments');
    
    // Insert sample contacts
    console.log('👥 Inserting contacts...');
    const contacts = [
        ['Emily', 'Johnson', 'emily@test.com', '555-0199', 'Lower back pain', 'Client'],
        ['John', 'Smith', 'john@test.com', '555-0101', 'Neck stiffness', 'Lead'],
        ['Sarah', 'Davis', 'sarah@test.com', '555-0102', 'Shoulder pain', 'Client'],
        ['Mike', 'Wilson', 'mike@test.com', '555-0103', 'Hip issues', 'Lead'],
        ['Lisa', 'Brown', 'lisa@test.com', '555-0104', 'Posture problems', 'Client'],
        ['David', 'Miller', 'david@test.com', '555-0105', 'Knee pain', 'Client'],
        ['Anna', 'Garcia', 'anna@test.com', '555-0106', 'Headaches', 'Lead']
    ];
    
    contacts.forEach((contact, i) => {
        db.run(`INSERT INTO contacts (first_name, last_name, email, phone, primary_complaint, status) 
                VALUES (?, ?, ?, ?, ?, ?)`, contact, function(err) {
            if (err) console.error('❌ Contact error:', err.message);
            else console.log(`✅ Contact ${i+1} inserted: ${contact[0]} ${contact[1]}`);
        });
    });
    
    // Insert sample appointments
    console.log('📅 Inserting appointments...');
    const appointments = [
        [1, '2024-09-20 10:00:00', 'Initial Assessment', 'First visit assessment', 'Scheduled'],
        [2, '2024-09-21 14:30:00', 'Follow-up', 'Progress check', 'Scheduled'],
        [3, '2024-09-22 09:15:00', 'Treatment', 'Regular treatment session', 'Completed'],
        [1, '2024-09-23 11:00:00', 'Treatment', 'Ongoing therapy', 'Scheduled'],
        [5, '2024-09-24 15:00:00', 'Assessment', 'Initial evaluation', 'Scheduled'],
        [6, '2024-09-25 13:30:00', 'Treatment', 'Follow-up session', 'Completed']
    ];
    
    appointments.forEach((appt, i) => {
        db.run(`INSERT INTO appointments (contact_id, date_time, type, notes, status) 
                VALUES (?, ?, ?, ?, ?)`, appt, function(err) {
            if (err) console.error('❌ Appointment error:', err.message);
            else console.log(`✅ Appointment ${i+1} inserted`);
        });
    });
    
    // Insert sample invoices
    console.log('💰 Inserting invoices...');
    const invoices = [
        [1, 150.00, 'Initial Assessment Session', 'Paid'],
        [3, 120.00, 'Treatment Session', 'Sent'],
        [1, 120.00, 'Follow-up Treatment', 'Overdue'],
        [5, 200.00, 'Package Deal - 4 Sessions', 'Paid'],
        [6, 180.00, 'Assessment + Treatment', 'Paid'],
        [3, 100.00, 'Single Session', 'Sent']
    ];
    
    invoices.forEach((invoice, i) => {
        db.run(`INSERT INTO invoices (contact_id, amount, description, status) 
                VALUES (?, ?, ?, ?)`, invoice, function(err) {
            if (err) console.error('❌ Invoice error:', err.message);
            else console.log(`✅ Invoice ${i+1} inserted: $${invoice[1]}`);
        });
    });
    
    // Insert sample treatment plans
    console.log('📋 Inserting treatment plans...');
    const plans = [
        ['Posture Correction Program', 'Comprehensive 12-week posture improvement', 12, 800.00, 'Weekly sessions focusing on alignment and strengthening'],
        ['Back Pain Relief', 'Targeted treatment for lower back issues', 8, 600.00, 'Manual therapy and exercise prescription'],
        ['Neck & Shoulder Package', 'Treatment for upper body tension', 6, 450.00, 'Massage and mobility work'],
        ['Sports Injury Recovery', 'Rehabilitation for athletic injuries', 10, 750.00, 'Progressive loading and return to sport'],
        ['Senior Mobility Program', 'Gentle therapy for older adults', 8, 400.00, 'Low-impact exercises and balance training'],
        ['Headache Relief Protocol', 'Treatment for tension headaches', 6, 350.00, 'Cervical spine treatment and stress management']
    ];
    
    plans.forEach((plan, i) => {
        db.run(`INSERT INTO treatment_plans (name, description, duration, price, template_content) 
                VALUES (?, ?, ?, ?, ?)`, plan, function(err) {
            if (err) console.error('❌ Treatment plan error:', err.message);
            else console.log(`✅ Treatment plan ${i+1} inserted: ${plan[0]}`);
        });
    });
    
    // Insert sample campaigns
    console.log('📢 Inserting campaigns...');
    const campaigns = [
        ['New Patient Special', 'Welcome New Patients', 'Get 50% off your first assessment session!', 'New Leads', 'Email', 'Active'],
        ['Back Pain Awareness', 'Back Pain Education', 'Learn about back pain prevention and treatment options', 'All Patients', 'SMS', 'Draft'],
        ['Holiday Wellness', 'Holiday Health Tips', 'Stay healthy during the holiday season', 'Active Clients', 'Email', 'Completed'],
        ['Referral Program', 'Refer a Friend', 'Get $25 credit for each successful referral', 'All Patients', 'Email', 'Active']
    ];
    
    campaigns.forEach((campaign, i) => {
        db.run(`INSERT INTO campaigns (name, subject, content, target_audience, channel, status) 
                VALUES (?, ?, ?, ?, ?, ?)`, campaign, function(err) {
            if (err) console.error('❌ Campaign error:', err.message);
            else console.log(`✅ Campaign ${i+1} inserted: ${campaign[0]}`);
        });
    });
    
    // Insert sample packages
    console.log('📦 Inserting packages...');
    const packages = [
        ['Starter Package', 4, 300.00, 'Perfect for new patients - 4 treatment sessions'],
        ['Standard Package', 8, 560.00, 'Most popular - 8 sessions with 30% savings'],
        ['Premium Package', 12, 780.00, 'Best value - 12 sessions with maximum savings'],
        ['Assessment Only', 1, 150.00, 'Initial assessment and treatment plan'],
        ['Maintenance Package', 6, 420.00, 'Ongoing maintenance for existing patients']
    ];
    
    packages.forEach((pkg, i) => {
        db.run(`INSERT INTO packages (name, number_of_sessions, price, description) 
                VALUES (?, ?, ?, ?)`, pkg, function(err) {
            if (err) console.error('❌ Package error:', err.message);
            else console.log(`✅ Package ${i+1} inserted: ${pkg[0]}`);
        });
    });
    
    // Insert sample reviews
    console.log('⭐ Inserting reviews...');
    const reviews = [
        [1, 5, 'Excellent service! My back pain is completely gone after the treatment program.', '2024-09-15', 1],
        [3, 4, 'Very professional staff and effective treatments. Highly recommend!', '2024-09-10', 1],
        [5, 5, 'Amazing results! The posture correction program changed my life.', '2024-09-08', 1],
        [6, 4, 'Great experience, friendly staff, and noticeable improvement in my condition.', '2024-09-05', 1]
    ];
    
    reviews.forEach((review, i) => {
        db.run(`INSERT INTO reviews (contact_id, rating, review_text, review_date, is_public) 
                VALUES (?, ?, ?, ?, ?)`, review, function(err) {
            if (err) console.error('❌ Review error:', err.message);
            else console.log(`✅ Review ${i+1} inserted: ${review[1]} stars`);
        });
    });
    
    // Insert sample feedback requests
    console.log('📝 Inserting feedback requests...');
    const feedbackRequests = [
        [1, '2024-09-15', 'Completed', 'Very satisfied with treatment', 5],
        [3, '2024-09-12', 'Completed', 'Good progress, would recommend', 4],
        [2, '2024-09-18', 'Sent', null, null],
        [7, '2024-09-19', 'Sent', null, null]
    ];
    
    feedbackRequests.forEach((feedback, i) => {
        db.run(`INSERT INTO feedback_requests (contact_id, request_date, status, feedback_received, rating) 
                VALUES (?, ?, ?, ?, ?)`, feedback, function(err) {
            if (err) console.error('❌ Feedback error:', err.message);
            else console.log(`✅ Feedback request ${i+1} inserted`);
        });
    });
    
    // Insert sample patient sessions
    console.log('📋 Inserting patient sessions...');
    const sessions = [
        [1, '2024-09-10', 'Treatment', 60, 7, 3, 'Manual therapy, exercises', 'Daily stretches', 'Good progress, pain reduced'],
        [3, '2024-09-12', 'Assessment', 90, 6, 6, 'Initial evaluation', 'Home exercises', 'Baseline assessment completed'],
        [5, '2024-09-14', 'Treatment', 45, 8, 4, 'Posture correction', 'Ergonomic tips', 'Significant improvement noted']
    ];
    
    sessions.forEach((session, i) => {
        db.run(`INSERT INTO patient_sessions (contact_id, session_date, session_type, duration_minutes, pre_session_pain, post_session_pain, treatments_performed, homework_assigned, therapist_notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, session, function(err) {
            if (err) console.error('❌ Session error:', err.message);
            else console.log(`✅ Patient session ${i+1} inserted`);
        });
    });
    
    // Insert sample patient assessments
    console.log('📋 Inserting patient assessments...');
    const assessments = [
        [1, '2024-09-01', 'Patient presents with chronic lower back pain. Forward head posture noted.', 'Anterior pelvic tilt, rounded shoulders', 'Strengthen core, improve posture awareness'],
        [3, '2024-09-05', 'Shoulder impingement syndrome. Limited range of motion in right shoulder.', 'Elevated right shoulder, muscle tension', 'Manual therapy, stretching program'],
        [5, '2024-09-08', 'Postural dysfunction from prolonged sitting. Neck and upper back tension.', 'Forward head posture, thoracic kyphosis', 'Ergonomic education, strengthening exercises']
    ];
    
    assessments.forEach((assessment, i) => {
        db.run(`INSERT INTO patient_assessments (contact_id, assessment_date, therapist_notes, observed_posture, recommendations) 
                VALUES (?, ?, ?, ?, ?)`, assessment, function(err) {
            if (err) console.error('❌ Assessment error:', err.message);
            else console.log(`✅ Patient assessment ${i+1} inserted`);
        });
    });
    
    // Verify data insertion
    setTimeout(() => {
        console.log('\n📊 Verifying comprehensive data insertion...');
        
        const tables = ['contacts', 'appointments', 'invoices', 'treatment_plans', 'campaigns', 'packages', 'reviews', 'feedback_requests', 'patient_sessions', 'patient_assessments'];
        
        tables.forEach(table => {
            db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
                if (!err) console.log(`✅ ${table}: ${row.count} records`);
            });
        });
        
        console.log('\n🎉 Comprehensive sample data insertion complete!');
        console.log('🚀 Restart your server to see all the data!');
        db.close();
    }, 3000);
});
