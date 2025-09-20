const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Searching for undefined values in database...\n');

const tables = [
    'contacts', 'appointments', 'invoices', 'treatment_plans', 
    'campaigns', 'packages', 'reviews', 'feedback_requests', 
    'patient_sessions', 'patient_assessments', 'users'
];

let totalUndefined = 0;

function checkTable(tableName) {
    return new Promise((resolve) => {
        db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
            if (err) {
                console.log(`❌ Error checking ${tableName}:`, err.message);
                resolve();
                return;
            }

            if (!rows || rows.length === 0) {
                console.log(`📋 ${tableName}: No data found`);
                resolve();
                return;
            }

            console.log(`📋 Checking ${tableName} (${rows.length} records):`);
            
            let tableUndefined = 0;
            
            rows.forEach((row, index) => {
                Object.keys(row).forEach(column => {
                    const value = row[column];
                    if (value === null || value === undefined || value === 'undefined' || value === '') {
                        console.log(`   ❌ Row ${index + 1}, Column '${column}': ${value === null ? 'NULL' : value === '' ? 'EMPTY' : 'UNDEFINED'}`);
                        tableUndefined++;
                        totalUndefined++;
                    }
                });
            });
            
            if (tableUndefined === 0) {
                console.log(`   ✅ No undefined values found`);
            } else {
                console.log(`   📊 Found ${tableUndefined} undefined/null/empty values`);
            }
            console.log('');
            
            resolve();
        });
    });
}

async function checkAllTables() {
    for (const table of tables) {
        await checkTable(table);
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`Total undefined/null/empty values found: ${totalUndefined}`);
    
    if (totalUndefined > 0) {
        console.log(`\n🔧 To fix these issues, run: node fix-undefined-data.js`);
    } else {
        console.log(`\n✅ Database is clean - no undefined values found!`);
    }
    
    db.close();
}

checkAllTables();
