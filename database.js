const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');

// Initialize database
function initDatabase() {
    const db = new sqlite3.Database(dbPath);
    
    const sqlFiles = [
        'init-db.sql',
        'extended-db.sql', 
        'invoices-db.sql',
        'templates-db.sql',
        'patient-profile-db.sql',
        'users-db.sql',
        'admin-enhancements.sql',
        'dummy-data.sql',
        'fix-admin.sql'
    ];
    
    let completed = 0;
    
    function executeNext() {
        if (completed >= sqlFiles.length) {
            insertDefaultTemplates(db);
            return;
        }
        
        const sqlFile = sqlFiles[completed];
        const sql = fs.readFileSync(path.join(__dirname, sqlFile), 'utf8');
        
        db.exec(sql, (err) => {
            if (err) {
                console.error(`Error executing ${sqlFile}:`, err);
            } else {
                console.log(`${sqlFile} executed successfully`);
            }
            completed++;
            executeNext();
        });
    }
    
    executeNext();
    return db;
}

function insertDefaultTemplates(db) {
    const templates = [
        {
            name: '6-Week Posture Correction Plan',
            description: 'Comprehensive posture correction program',
            duration: '6 weeks',
            price: 299.99,
            content: 'Week 1-2: Assessment and basic exercises\nWeek 3-4: Strengthening routines\nWeek 5-6: Advanced corrections and maintenance'
        },
        {
            name: '1-on-1 Online Coaching Package',
            description: 'Personal coaching sessions',
            duration: '4 weeks',
            price: 199.99,
            content: '4 weekly 1-hour sessions\nPersonalized exercise plan\n24/7 support via messaging'
        }
    ];

    templates.forEach(template => {
        const sql = `INSERT OR IGNORE INTO treatment_plans (name, description, duration, price, template_content) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [template.name, template.description, template.duration, template.price, template.content]);
    });
}

// Connect to database
function connectDatabase() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error connecting to database:', err);
        } else {
            console.log('Connected to SQLite database');
        }
    });
}

module.exports = { initDatabase, connectDatabase };
