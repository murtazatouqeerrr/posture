require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('Testing database functionality...');

// Initialize database
const dbPath = process.env.DB_PATH || './crm.db';
const db = new sqlite3.Database(dbPath);

// Initialize schema
const schemaPath = path.join(__dirname, 'database-schema.sql');
if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    db.serialize(() => {
        statements.forEach(statement => {
            if (statement.trim()) {
                db.run(statement.trim(), (err) => {
                    if (err && !err.message.includes('already exists')) {
                        console.error('Database error:', err.message);
                    }
                });
            }
        });
        
        // Test queries
        console.log('\n=== Testing Database ===');
        
        // Test contacts
        db.all('SELECT COUNT(*) as count FROM contacts', [], (err, rows) => {
            if (err) {
                console.error('Contacts query error:', err.message);
            } else {
                console.log('✅ Contacts table:', rows[0].count, 'records');
            }
        });
        
        // Test appointments
        db.all('SELECT COUNT(*) as count FROM appointments', [], (err, rows) => {
            if (err) {
                console.error('Appointments query error:', err.message);
            } else {
                console.log('✅ Appointments table:', rows[0].count, 'records');
            }
        });
        
        // Test invoices
        db.all('SELECT COUNT(*) as count FROM invoices', [], (err, rows) => {
            if (err) {
                console.error('Invoices query error:', err.message);
            } else {
                console.log('✅ Invoices table:', rows[0].count, 'records');
            }
        });
        
        // Test treatment plans
        db.all('SELECT COUNT(*) as count FROM treatment_plans', [], (err, rows) => {
            if (err) {
                console.error('Treatment plans query error:', err.message);
            } else {
                console.log('✅ Treatment plans table:', rows[0].count, 'records');
            }
        });
        
        // Test new tables
        db.all('SELECT COUNT(*) as count FROM subscription_plans', [], (err, rows) => {
            if (err) {
                console.error('Subscription plans query error:', err.message);
            } else {
                console.log('✅ Subscription plans table:', rows[0].count, 'records');
            }
        });
        
        db.all('SELECT COUNT(*) as count FROM users', [], (err, rows) => {
            if (err) {
                console.error('Users query error:', err.message);
            } else {
                console.log('✅ Users table:', rows[0].count, 'records');
            }
            
            // Close database after all tests
            setTimeout(() => {
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    } else {
                        console.log('\n✅ Database test completed successfully!');
                        console.log('\n=== Next Steps ===');
                        console.log('1. Update .env file with your Stripe keys');
                        console.log('2. Update public/payment.js with your Stripe publishable key');
                        console.log('3. Run: npm run dev');
                        console.log('4. Open: http://localhost:3000');
                        console.log('5. Login with: admin / admin123');
                    }
                });
            }, 1000);
        });
    });
} else {
    console.error('Database schema file not found');
}
