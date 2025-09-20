// Simple API test without SQLite
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Mock data for testing
const mockContacts = [
    {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@email.com',
        phone: '555-0123',
        primary_complaint: 'Lower back pain',
        status: 'Client',
        source: 'Website',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@email.com',
        phone: '555-0124',
        primary_complaint: 'Neck stiffness',
        status: 'Lead',
        source: 'Referral',
        created_at: new Date().toISOString()
    }
];

// Test API endpoints
app.get('/api/contacts', (req, res) => {
    console.log('📞 GET /api/contacts');
    res.json(mockContacts);
});

app.get('/api/contacts/:id', (req, res) => {
    console.log(`📞 GET /api/contacts/${req.params.id}`);
    const contact = mockContacts.find(c => c.id == req.params.id);
    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
});

app.put('/api/contacts/:id', (req, res) => {
    console.log(`📞 PUT /api/contacts/${req.params.id}`);
    const contactIndex = mockContacts.findIndex(c => c.id == req.params.id);
    if (contactIndex === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    // Update contact
    mockContacts[contactIndex] = { ...mockContacts[contactIndex], ...req.body };
    res.json({ message: 'Contact updated successfully' });
});

app.delete('/api/contacts/:id', (req, res) => {
    console.log(`📞 DELETE /api/contacts/${req.params.id}`);
    const contactIndex = mockContacts.findIndex(c => c.id == req.params.id);
    if (contactIndex === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    // Remove contact
    mockContacts.splice(contactIndex, 1);
    res.json({ message: 'Contact deleted successfully' });
});

// Mock invoices endpoint
app.get('/api/invoices', (req, res) => {
    console.log('💰 GET /api/invoices');
    res.json([]);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Test server running on http://localhost:${PORT}`);
    console.log('📊 Mock data loaded with 2 contacts');
});
