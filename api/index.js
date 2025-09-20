const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mock data
const mockData = {
    contacts: [
        { id: 1, first_name: "Emily", last_name: "Johnson", email: "emily@test.com", phone: "555-0199", primary_complaint: "Lower back pain", status: "Client" },
        { id: 2, first_name: "John", last_name: "Smith", email: "john@test.com", phone: "555-0101", primary_complaint: "Neck stiffness", status: "Lead" },
        { id: 3, first_name: "Sarah", last_name: "Davis", email: "sarah@test.com", phone: "555-0102", primary_complaint: "Shoulder pain", status: "Client" }
    ],
    packages: [
        { id: 1, name: "Starter Package", number_of_sessions: 4, price: 299.99, description: "Perfect for beginners" },
        { id: 2, name: "Standard Package", number_of_sessions: 8, price: 549.99, description: "Most popular choice" },
        { id: 3, name: "Premium Package", number_of_sessions: 12, price: 799.99, description: "Complete treatment plan" }
    ]
};

// API Routes
app.get('/api/contacts', (req, res) => res.json(mockData.contacts));
app.get('/api/packages', (req, res) => res.json(mockData.packages));
app.get('/api/appointments', (req, res) => res.json([]));
app.get('/api/invoices', (req, res) => res.json([]));
app.get('/api/treatment-plans', (req, res) => res.json([]));
app.get('/api/subscriptions', (req, res) => res.json([]));
app.get('/api/campaigns', (req, res) => res.json([]));

app.get('/api/reports/leads-per-month', (req, res) => res.json([
    { month: 'Jan', leads: 15 },
    { month: 'Feb', leads: 22 },
    { month: 'Mar', leads: 18 }
]));

app.get('/api/admin/analytics/financial', (req, res) => res.json({
    total_revenue: 14500,
    monthly_growth: 0.12,
    active_patients: 45,
    pending_invoices: 8
}));

// Static routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
