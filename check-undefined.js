const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking for undefined/null values...\n');

// Check contacts
db.all('SELECT * FROM contacts', [], (err, rows) => {
    if (err) {
        console.log('❌ Error:', err.message);
        return;
    }
    
    console.log('📞 CONTACTS TABLE:');
    if (rows.length === 0) {
        console.log('   No data found\n');
        return;
    }
    
    rows.forEach((row, i) => {
        let hasUndefined = false;
        Object.keys(row).forEach(col => {
            if (row[col] === null || row[col] === '' || row[col] === 'undefined') {
                if (!hasUndefined) {
                    console.log(`   Row ${i+1} (ID: ${row.id}):`);
                    hasUndefined = true;
                }
                console.log(`     ${col}: ${row[col] === null ? 'NULL' : row[col] === '' ? 'EMPTY' : 'UNDEFINED'}`);
            }
        });
    });
    
    if (!rows.some(row => Object.values(row).some(val => val === null || val === '' || val === 'undefined'))) {
        console.log('   ✅ No issues found');
    }
    console.log('');
});

// Check appointments
db.all('SELECT * FROM appointments', [], (err, rows) => {
    if (err) {
        console.log('❌ Error:', err.message);
        return;
    }
    
    console.log('📅 APPOINTMENTS TABLE:');
    if (rows.length === 0) {
        console.log('   No data found\n');
        return;
    }
    
    rows.forEach((row, i) => {
        let hasUndefined = false;
        Object.keys(row).forEach(col => {
            if (row[col] === null || row[col] === '' || row[col] === 'undefined') {
                if (!hasUndefined) {
                    console.log(`   Row ${i+1} (ID: ${row.id}):`);
                    hasUndefined = true;
                }
                console.log(`     ${col}: ${row[col] === null ? 'NULL' : row[col] === '' ? 'EMPTY' : 'UNDEFINED'}`);
            }
        });
    });
    
    if (!rows.some(row => Object.values(row).some(val => val === null || val === '' || val === 'undefined'))) {
        console.log('   ✅ No issues found');
    }
    console.log('');
});

// Check packages
db.all('SELECT * FROM packages', [], (err, rows) => {
    if (err) {
        console.log('❌ Error:', err.message);
        return;
    }
    
    console.log('📦 PACKAGES TABLE:');
    if (rows.length === 0) {
        console.log('   No data found\n');
        return;
    }
    
    rows.forEach((row, i) => {
        let hasUndefined = false;
        Object.keys(row).forEach(col => {
            if (row[col] === null || row[col] === '' || row[col] === 'undefined') {
                if (!hasUndefined) {
                    console.log(`   Row ${i+1} (ID: ${row.id}):`);
                    hasUndefined = true;
                }
                console.log(`     ${col}: ${row[col] === null ? 'NULL' : row[col] === '' ? 'EMPTY' : 'UNDEFINED'}`);
            }
        });
    });
    
    if (!rows.some(row => Object.values(row).some(val => val === null || val === '' || val === 'undefined'))) {
        console.log('   ✅ No issues found');
    }
    
    setTimeout(() => {
        db.close();
        console.log('\n✅ Check complete');
    }, 100);
});
