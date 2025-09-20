const http = require('http');

// Sample patient data
const samplePatient = {
    first_name: 'Emily',
    last_name: 'Johnson',
    email: 'emily.johnson@email.com',
    phone: '555-0199',
    primary_complaint: 'Chronic lower back pain and sciatica',
    status: 'Client'
};

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function addSampleData() {
    try {
        console.log('🚀 Starting server to add sample data...');
        
        // Start the server
        const server = require('./server.js');
        
        // Wait a moment for server to start
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📝 Adding sample patient...');
        
        // Add patient via API
        const patientOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/contacts',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const patientResult = await makeRequest(patientOptions, samplePatient);
        console.log('✅ Sample patient added:', patientResult);
        
        console.log('\n📋 SAMPLE PATIENT DETAILS:');
        console.log('==========================');
        console.log(`Name: ${samplePatient.first_name} ${samplePatient.last_name}`);
        console.log(`Email: ${samplePatient.email}`);
        console.log(`Phone: ${samplePatient.phone}`);
        console.log(`Primary Complaint: ${samplePatient.primary_complaint}`);
        console.log(`Status: ${samplePatient.status}`);
        
        console.log('\n🔐 LOGIN CREDENTIALS:');
        console.log('=====================');
        console.log('Username: admin');
        console.log('Password: password');
        console.log('Email: admin@example.com');
        
        console.log('\n🚀 Access your patient dashboard at: http://localhost:3000');
        console.log('📊 The sample patient will appear in your contacts list');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Check if server is already running
const testOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
};

http.request(testOptions, (res) => {
    console.log('✅ Server is already running');
    addSampleData();
}).on('error', () => {
    console.log('🚀 Starting server...');
    addSampleData();
}).end();
