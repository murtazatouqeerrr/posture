// Simple test to verify API endpoints work
const app = require('./api/index.js');
const request = require('supertest');

async function testAPI() {
    console.log('🧪 Testing Vercel API endpoints...\n');
    
    try {
        // Test contacts endpoint
        const contactsRes = await request(app).get('/api/contacts');
        console.log('✅ /api/contacts:', contactsRes.status === 200 ? 'OK' : 'FAILED');
        
        // Test reports endpoint
        const revenueRes = await request(app).get('/api/reports/revenue-per-month');
        console.log('✅ /api/reports/revenue-per-month:', revenueRes.status === 200 ? 'OK' : 'FAILED');
        
        // Check if revenue is formatted
        if (revenueRes.body && revenueRes.body.length > 0) {
            const firstItem = revenueRes.body[0];
            console.log('💰 Revenue formatting example:', firstItem.formattedRevenue || 'Not formatted');
        }
        
        // Test financial analytics
        const analyticsRes = await request(app).get('/api/admin/analytics/financial');
        console.log('✅ /api/admin/analytics/financial:', analyticsRes.status === 200 ? 'OK' : 'FAILED');
        
        if (analyticsRes.body) {
            console.log('💰 Total Revenue:', analyticsRes.body.total_revenue);
            console.log('💰 Monthly Revenue:', analyticsRes.body.monthly_recurring_revenue);
        }
        
        console.log('\n🎉 All tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    testAPI();
}

module.exports = testAPI;
