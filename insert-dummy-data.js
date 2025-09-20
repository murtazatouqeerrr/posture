const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Inserting dummy data...');

db.serialize(() => {
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    db.run('DELETE FROM contacts');
    db.run('DELETE FROM appointments');
    db.run('DELETE FROM invoices');
    db.run('DELETE FROM treatment_plans');
    
    // Insert dummy contacts
    console.log('👥 Inserting contacts...');
    const contacts = [
        ['Emily', 'Johnson', 'emily@test.com', '555-0199', 'Lower back pain', 'Client'],
        ['John', 'Smith', 'john@test.com', '555-0101', 'Neck stiffness', 'Lead'],
        ['Sarah', 'Davis', 'sarah@test.com', '555-0102', 'Shoulder pain', 'Client'],
        ['Mike', 'Wilson', 'mike@test.com', '555-0103', 'Hip issues', 'Lead'],
        ['Lisa', 'Brown', 'lisa@test.com', '555-0104', 'Posture problems', 'Client']
    ];
    
    contacts.forEach((contact, i) => {
        db.run(`INSERT INTO contacts (first_name, last_name, email, phone, primary_complaint, status) 
                VALUES (?, ?, ?, ?, ?, ?)`, contact, function(err) {
            if (err) console.error('❌ Contact error:', err.message);
            else console.log(`✅ Contact ${i+1} inserted with ID: ${this.lastID}`);
        });
    });
    
    // Insert dummy appointments
    console.log('📅 Inserting appointments...');
    const appointments = [
        [1, '2024-09-20 10:00:00', 'Initial Assessment', 'First visit assessment', 'Scheduled'],
        [2, '2024-09-21 14:30:00', 'Follow-up', 'Progress check', 'Scheduled'],
        [3, '2024-09-22 09:15:00', 'Treatment', 'Regular treatment session', 'Completed'],
        [1, '2024-09-23 11:00:00', 'Treatment', 'Ongoing therapy', 'Scheduled']
    ];
    
    appointments.forEach((appt, i) => {
        db.run(`INSERT INTO appointments (contact_id, date_time, type, notes, status) 
                VALUES (?, ?, ?, ?, ?)`, appt, function(err) {
            if (err) console.error('❌ Appointment error:', err.message);
            else console.log(`✅ Appointment ${i+1} inserted with ID: ${this.lastID}`);
        });
    });
    
    // Insert dummy invoices
    console.log('💰 Inserting invoices...');
    const invoices = [
        [1, 150.00, 'Initial Assessment Session', 'Paid'],
        [3, 120.00, 'Treatment Session', 'Sent'],
        [1, 120.00, 'Follow-up Treatment', 'Overdue'],
        [5, 200.00, 'Package Deal - 4 Sessions', 'Paid']
    ];
    
    invoices.forEach((invoice, i) => {
        db.run(`INSERT INTO invoices (contact_id, amount, description, status) 
                VALUES (?, ?, ?, ?)`, invoice, function(err) {
            if (err) console.error('❌ Invoice error:', err.message);
            else console.log(`✅ Invoice ${i+1} inserted with ID: ${this.lastID}`);
        });
    });
    
    // Insert dummy treatment plans
    console.log('📋 Inserting treatment plans...');
    const plans = [
        ['Posture Correction Program', 'Comprehensive 12-week posture improvement', 12, 800.00, 'Weekly sessions focusing on alignment and strengthening'],
        ['Back Pain Relief', 'Targeted treatment for lower back issues', 8, 600.00, 'Manual therapy and exercise prescription'],
        ['Neck & Shoulder Package', 'Treatment for upper body tension', 6, 450.00, 'Massage and mobility work'],
        ['Sports Injury Recovery', 'Rehabilitation for athletic injuries', 10, 750.00, 'Progressive loading and return to sport'],
        ['Senior Mobility Program', 'Gentle therapy for older adults', 8, 400.00, 'Low-impact exercises and balance training']
    ];
    
    plans.forEach((plan, i) => {
        db.run(`INSERT INTO treatment_plans (name, description, duration, price, template_content) 
                VALUES (?, ?, ?, ?, ?)`, plan, function(err) {
            if (err) console.error('❌ Treatment plan error:', err.message);
            else console.log(`✅ Treatment plan ${i+1} inserted with ID: ${this.lastID}`);
        });
    });
    
    // Verify data insertion
    setTimeout(() => {
        console.log('\n📊 Verifying data insertion...');
        
        db.get('SELECT COUNT(*) as count FROM contacts', (err, row) => {
            if (!err) console.log(`✅ Contacts: ${row.count} records`);
        });
        
        db.get('SELECT COUNT(*) as count FROM appointments', (err, row) => {
            if (!err) console.log(`✅ Appointments: ${row.count} records`);
        });
        
        db.get('SELECT COUNT(*) as count FROM invoices', (err, row) => {
            if (!err) console.log(`✅ Invoices: ${row.count} records`);
        });
        
        db.get('SELECT COUNT(*) as count FROM treatment_plans', (err, row) => {
            if (!err) console.log(`✅ Treatment Plans: ${row.count} records`);
        });
        
        console.log('\n🎉 Dummy data insertion complete!');
        db.close();
    }, 2000);
});
