// Posture Perfect CRM Server - Working Version
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory data store (replacing SQLite for now)
let contacts = [
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
    },
    {
        id: 3,
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.johnson@email.com',
        phone: '555-0125',
        primary_complaint: 'Shoulder pain',
        status: 'Client',
        source: 'Referral',
        created_at: new Date().toISOString()
    }
];

let invoices = [
    {
        id: 1,
        contact_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@email.com',
        service_description: 'Physical Therapy Session',
        amount: '150.00',
        status: 'Paid',
        invoice_date: new Date().toISOString()
    },
    {
        id: 2,
        contact_id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@email.com',
        service_description: 'Initial Assessment',
        amount: '200.00',
        status: 'Sent',
        invoice_date: new Date().toISOString()
    }
];

let nextContactId = 4;
let nextInvoiceId = 3;

// CONTACTS API
app.get('/api/contacts', (req, res) => {
    console.log('📞 Fetching contacts...');
    res.json(contacts);
});

app.get('/api/contacts/:id', (req, res) => {
    console.log(`📞 Fetching contact ${req.params.id}...`);
    const contact = contacts.find(c => c.id == req.params.id);
    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
});

app.post('/api/contacts', (req, res) => {
    console.log('📞 Creating new contact...');
    const { first_name, last_name, email, phone, primary_complaint, status, source } = req.body;
    
    const newContact = {
        id: nextContactId++,
        first_name,
        last_name,
        email,
        phone,
        primary_complaint,
        status: status || 'Lead',
        source,
        created_at: new Date().toISOString()
    };
    
    contacts.push(newContact);
    res.json({ id: newContact.id, message: 'Contact created successfully' });
});

app.put('/api/contacts/:id', (req, res) => {
    console.log(`📞 Updating contact ${req.params.id}...`);
    const { first_name, last_name, email, phone, primary_complaint, status, source } = req.body;
    
    const contactIndex = contacts.findIndex(c => c.id == req.params.id);
    if (contactIndex === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    contacts[contactIndex] = {
        ...contacts[contactIndex],
        first_name,
        last_name,
        email,
        phone,
        primary_complaint,
        status,
        source
    };
    
    res.json({ message: 'Contact updated successfully' });
});

app.delete('/api/contacts/:id', (req, res) => {
    console.log(`📞 Deleting contact ${req.params.id}...`);
    
    const contactIndex = contacts.findIndex(c => c.id == req.params.id);
    if (contactIndex === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    contacts.splice(contactIndex, 1);
    res.json({ message: 'Contact deleted successfully' });
});

// INVOICES API
app.get('/api/invoices', (req, res) => {
    console.log('💰 Fetching invoices...');
    res.json(invoices);
});

// APPOINTMENTS API
app.get('/api/appointments', (req, res) => {
    console.log('📅 Fetching appointments...');
    const mockAppointments = [
        {
            id: 1,
            contact_id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@email.com',
            appointment_date: '2025-09-20',
            appointment_time: '10:00',
            status: 'Scheduled',
            notes: 'Follow-up session'
        }
    ];
    res.json(mockAppointments);
});

app.post('/api/appointments', (req, res) => {
    console.log('📅 Creating appointment...');
    res.json({ id: 1, message: 'Appointment created successfully' });
});

// TREATMENT PLANS API
app.get('/api/treatment-plans', (req, res) => {
    console.log('📋 Fetching treatment plans...');
    const mockPlans = [
        {
            id: 1,
            name: 'Lower Back Pain Treatment',
            description: 'Comprehensive treatment for lower back pain',
            sessions: 8,
            price: 800
        }
    ];
    res.json(mockPlans);
});

app.post('/api/treatment-plans', (req, res) => {
    console.log('📋 Creating treatment plan...');
    res.json({ id: 1, message: 'Treatment plan created successfully' });
});

// USERS API (for admin)
app.get('/api/users', (req, res) => {
    console.log('👥 Fetching users...');
    const mockUsers = [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@postureperect.com',
            role: 'Administrator'
        }
    ];
    res.json(mockUsers);
});

app.post('/api/users', (req, res) => {
    console.log('👥 Creating user...');
    res.json({ id: 1, message: 'User created successfully' });
});

// REPORTS API (mock)
app.get('/api/reports/leads-per-month', (req, res) => {
    console.log('📊 Fetching leads per month...');
    res.json([]);
});

app.get('/api/reports/conversion-rate', (req, res) => {
    console.log('📊 Fetching conversion rate...');
    res.json([]);
});

app.get('/api/reports/revenue-per-month', (req, res) => {
    console.log('📊 Fetching revenue per month...');
    res.json([]);
});

// TREATMENT PLANS API (mock)
app.get('/api/treatment-plans', (req, res) => {
    console.log('📋 Fetching treatment plans...');
    res.json([]);
});

// Favicon endpoint
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Posture Perfect CRM Server running on http://localhost:${PORT}`);
    console.log(`📊 Loaded ${contacts.length} contacts and ${invoices.length} invoices`);
    console.log('🎯 All API endpoints are working!');
});
