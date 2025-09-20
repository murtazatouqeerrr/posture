const express = require('express');
const app = express();
const PORT = 3000;

console.log('Starting test server...');

app.use(express.json());
app.use(express.static('public'));

app.get('/api/contacts', (req, res) => {
    res.json([{id: 100, first_name: "Emily", last_name: "Johnson", email: "emily@test.com"}]);
});

app.get('/', (req, res) => {
    res.send('Server is working!');
});

app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
});
