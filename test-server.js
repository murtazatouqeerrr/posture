// Test script to verify server functionality
const http = require('http');

function testAPI(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: body
                });
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing API endpoints...\n');
    
    try {
        // Test GET contacts
        console.log('1. Testing GET /api/contacts');
        const getResult = await testAPI('GET', '/api/contacts');
        console.log(`   Status: ${getResult.status}`);
        console.log(`   Data: ${getResult.data.substring(0, 100)}...\n`);
        
        // Test PUT contact
        console.log('2. Testing PUT /api/contacts/1');
        const putResult = await testAPI('PUT', '/api/contacts/1', {
            first_name: 'John Updated',
            last_name: 'Doe',
            email: 'john.doe@email.com',
            phone: '555-0123',
            primary_complaint: 'Updated back pain',
            status: 'Client',
            source: 'Website'
        });
        console.log(`   Status: ${putResult.status}`);
        console.log(`   Data: ${putResult.data}\n`);
        
        // Test DELETE contact
        console.log('3. Testing DELETE /api/contacts/3');
        const deleteResult = await testAPI('DELETE', '/api/contacts/3');
        console.log(`   Status: ${deleteResult.status}`);
        console.log(`   Data: ${deleteResult.data}\n`);
        
        console.log('✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

runTests();
