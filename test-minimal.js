console.log('Starting minimal server...');
const express = require('express');
console.log('Express loaded');
const app = express();
console.log('App created');
app.get('/api/contacts', (req, res) => {
    console.log('Contacts endpoint called');
    res.json([{id: 1, name: 'Test'}]);
});
console.log('Route configured');
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
console.log('Listen called');
