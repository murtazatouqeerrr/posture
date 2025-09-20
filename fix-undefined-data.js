const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing undefined values in database...\n');

db.serialize(() => {
    // Fix contacts table
    console.log('📞 Fixing contacts table...');
    db.run(`UPDATE contacts SET 
        first_name = COALESCE(NULLIF(first_name, ''), NULLIF(first_name, 'undefined'), 'John'),
        last_name = COALESCE(NULLIF(last_name, ''), NULLIF(last_name, 'undefined'), 'Doe'),
        email = COALESCE(NULLIF(email, ''), NULLIF(email, 'undefined'), 'patient@example.com'),
        phone = COALESCE(NULLIF(phone, ''), NULLIF(phone, 'undefined'), '555-0123'),
        primary_complaint = COALESCE(NULLIF(primary_complaint, ''), NULLIF(primary_complaint, 'undefined'), 'General consultation'),
        status = COALESCE(NULLIF(status, ''), NULLIF(status, 'undefined'), 'Lead')
    WHERE first_name IS NULL OR first_name = '' OR first_name = 'undefined'
       OR last_name IS NULL OR last_name = '' OR last_name = 'undefined'
       OR email IS NULL OR email = '' OR email = 'undefined'
       OR phone IS NULL OR phone = '' OR phone = 'undefined'
       OR primary_complaint IS NULL OR primary_complaint = '' OR primary_complaint = 'undefined'
       OR status IS NULL OR status = '' OR status = 'undefined'`);

    // Fix appointments table (only existing columns)
    console.log('📅 Fixing appointments table...');
    db.run(`UPDATE appointments SET 
        type = COALESCE(NULLIF(type, ''), NULLIF(type, 'undefined'), 'Consultation'),
        notes = COALESCE(NULLIF(notes, ''), NULLIF(notes, 'undefined'), 'Standard appointment'),
        status = COALESCE(NULLIF(status, ''), NULLIF(status, 'undefined'), 'Scheduled')
    WHERE type IS NULL OR type = '' OR type = 'undefined'
       OR notes IS NULL OR notes = '' OR notes = 'undefined'
       OR status IS NULL OR status = '' OR status = 'undefined'`);

    // Fix invoices table
    console.log('💰 Fixing invoices table...');
    db.run(`UPDATE invoices SET 
        amount = COALESCE(amount, 150.00),
        description = COALESCE(NULLIF(description, ''), NULLIF(description, 'undefined'), 'Treatment session'),
        status = COALESCE(NULLIF(status, ''), NULLIF(status, 'undefined'), 'Sent')
    WHERE amount IS NULL OR amount = 0
       OR description IS NULL OR description = '' OR description = 'undefined'
       OR status IS NULL OR status = '' OR status = 'undefined'`);

    // Fix treatment_plans table
    console.log('📋 Fixing treatment_plans table...');
    db.run(`UPDATE treatment_plans SET 
        name = COALESCE(NULLIF(name, ''), NULLIF(name, 'undefined'), 'Treatment Plan'),
        description = COALESCE(NULLIF(description, ''), NULLIF(description, 'undefined'), 'Comprehensive treatment program'),
        duration = COALESCE(duration, 8),
        price = COALESCE(price, 299.99),
        template_content = COALESCE(NULLIF(template_content, ''), NULLIF(template_content, 'undefined'), 'Standard treatment protocol')
    WHERE name IS NULL OR name = '' OR name = 'undefined'
       OR description IS NULL OR description = '' OR description = 'undefined'
       OR duration IS NULL OR duration = 0
       OR price IS NULL OR price = 0
       OR template_content IS NULL OR template_content = '' OR template_content = 'undefined'`);

    setTimeout(() => {
        console.log('\n✅ Database cleanup completed!');
        console.log('🔍 Run: node find-undefined-data.js to verify fixes');
        db.close();
    }, 1000);
});
