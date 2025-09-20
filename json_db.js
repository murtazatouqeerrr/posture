const fs = require('fs');

// Simple JSON database
const db = {
    contacts: [
        {
            id: 100,
            first_name: 'Emily',
            last_name: 'Johnson',
            email: 'emily.johnson@email.com',
            phone: '555-0199',
            primary_complaint: 'Chronic lower back pain',
            status: 'Client'
        }
    ],
    patient_logins: [
        {
            id: 1,
            contact_id: 100,
            email: 'emily.johnson@email.com',
            password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
        }
    ],
    users: [
        {
            id: 1,
            username: 'admin',
            password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            name: 'Admin User',
            role: 'admin'
        }
    ]
};

fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));

console.log('✅ JSON database created: db.json');
console.log('📋 Patient login: emily.johnson@email.com / password');
console.log('🔐 Admin login: admin / password');
console.log('');
console.log('Update your server to use JSON instead of SQLite');
