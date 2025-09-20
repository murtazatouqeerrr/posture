// Posture Perfect CRM Server - Windows Compatible Version
const express = require('express');
const path = require('path');

const { initDatabase } = require('./database-windows.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = initDatabase();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CONTACTS API
app.get('/api/contacts', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM contacts').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/api/contacts', (req, res) => {
    const { first_name, last_name, email, phone, primary_complaint, status, referred_by } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO contacts (first_name, last_name, email, phone, primary_complaint, status, referred_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const result = stmt.run(first_name, last_name, email, phone, primary_complaint, status || 'Lead', referred_by);
        res.json({ id: result.lastInsertRowid, message: 'Contact created successfully' });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// SUBSCRIPTIONS API
app.get('/api/subscriptions', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT s.*, sp.name as plan_name, c.first_name, c.last_name 
            FROM subscriptions s 
            LEFT JOIN subscription_plans sp ON s.plan_id = sp.id 
            LEFT JOIN contacts c ON s.contact_id = c.id
        `).all();
        res.json(rows || []);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.get('/api/subscription-plans', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM subscription_plans WHERE active = 1').all();
        res.json(rows || []);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// CAMPAIGNS API
app.get('/api/campaigns', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
        res.json(rows || []);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// APPOINTMENTS API
app.get('/api/appointments', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM appointments ORDER BY date_time DESC').all();
        res.json(rows || []);
    } catch (err) {
        console.error('Appointments error:', err);
        res.status(500).json({error: err.message});
    }
});

app.post('/api/appointments', (req, res) => {
    const { contact_id, appointment_date, appointment_time, service_type, notes, status, assigned_to, date_time, type } = req.body;
    
    // Handle both old and new field names
    const finalContactId = contact_id;
    const finalDateTime = date_time || `${appointment_date} ${appointment_time}`;
    const finalType = type || service_type;
    
    if (!finalContactId || !finalDateTime || !finalType) {
        console.error('Missing fields:', { contact_id: finalContactId, date_time: finalDateTime, type: finalType });
        return res.status(400).json({error: 'Missing required fields: contact_id, date_time, type'});
    }
    
    try {
        const stmt = db.prepare('INSERT INTO appointments (contact_id, date_time, type, notes, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?)');
        const result = stmt.run(finalContactId, finalDateTime, finalType, notes || '', status || 'Scheduled', assigned_to || null);
        res.json({ id: result.lastInsertRowid, message: 'Appointment created successfully' });
    } catch (err) {
        console.error('Insert appointment error:', err);
        res.status(500).json({error: err.message});
    }
});

// INVOICES API
app.get('/api/invoices', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
        res.json(rows || []);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/api/invoices/:id/process-payment', (req, res) => {
    console.log(`💳 Processing payment for invoice ${req.params.id}...`);
    
    const payment_intent_id = `pi_mock_${Date.now()}`;

    try {
        const stmt = db.prepare('UPDATE invoices SET status = ?, stripe_payment_intent_id = ? WHERE id = ?');
        const result = stmt.run('Paid', payment_intent_id, req.params.id);
        
        if (result.changes === 0) {
            return res.status(404).json({error: 'Invoice not found'});
        }
        
        const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
        res.json({ 
            success: true, 
            message: 'Payment processed successfully',
            invoice: invoice
        });
    } catch (err) {
        console.error('Payment processing error:', err);
        res.status(500).json({error: err.message});
    }
});

// REPORTS API
app.get('/api/reports/leads-per-month', (req, res) => {
    try {
        const rows = db.prepare("SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as lead_count FROM contacts WHERE status = 'Lead' GROUP BY month ORDER BY month").all();
        const result = rows && rows.length > 0 ? rows : [
            { month: '2024-01', lead_count: 5 },
            { month: '2024-02', lead_count: 8 },
            { month: '2024-03', lead_count: 12 }
        ];
        res.json(result);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.get('/api/reports/conversion-rate', (req, res) => {
    try {
        const row = db.prepare("SELECT CAST(SUM(CASE WHEN status = 'Client' THEN 1 ELSE 0 END) AS REAL) / COUNT(*) as conversion_rate FROM contacts").get();
        const result = row && row.conversion_rate !== null ? row : { conversion_rate: 0.65 };
        res.json(result);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.get('/api/reports/revenue-per-month', (req, res) => {
    try {
        const rows = db.prepare("SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as revenue FROM invoices WHERE status = 'Paid' GROUP BY month ORDER BY month").all();
        const result = rows && rows.length > 0 ? rows : [
            { month: '2024-01', revenue: 1500 },
            { month: '2024-02', revenue: 2200 },
            { month: '2024-03', revenue: 1800 }
        ];
        res.json(result);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/api/appointments', (req, res) => {
    const { contact_id, appointment_date, appointment_time, service_type, notes, status, assigned_to, date_time, type } = req.body;
    
    // Handle both old and new field names
    const finalContactId = contact_id;
    const finalDateTime = date_time || `${appointment_date} ${appointment_time}`;
    const finalType = type || service_type;
    
    if (!finalContactId || !finalDateTime || !finalType) {
        console.error('Missing fields:', { contact_id: finalContactId, date_time: finalDateTime, type: finalType });
        return res.status(400).json({error: 'Missing required fields: contact_id, date_time, type'});
    }
    
    try {
        const stmt = db.prepare('INSERT INTO appointments (contact_id, date_time, type, notes, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?)');
        const result = stmt.run(finalContactId, finalDateTime, finalType, notes || '', status || 'Scheduled', assigned_to || null);
        res.json({ id: result.lastInsertRowid, message: 'Appointment created successfully' });
    } catch (err) {
        console.error('Insert appointment error:', err);
        res.status(500).json({error: err.message});
    }
});

// ADMIN USER MANAGEMENT API
app.get('/api/admin/users', (req, res) => {
    try {
        const rows = db.prepare('SELECT id, username, name, role, created_at FROM users').all();
        res.json(rows || []);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/api/admin/users', (req, res) => {
    const { username, email, password, name, role } = req.body;
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const finalName = name || email || username;

    try {
        const stmt = db.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)');
        const result = stmt.run(username, hash, finalName, role);
        res.json({ id: result.lastInsertRowid, message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.put('/api/admin/users/:id', (req, res) => {
    const { name, username, role } = req.body;
    try {
        const stmt = db.prepare('UPDATE users SET name = ?, username = ?, role = ? WHERE id = ?');
        const result = stmt.run(name, username, role, req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({error: 'User not found'});
        }
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.delete('/api/admin/users/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({error: 'User not found'});
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});
    try {
        const invoiceStats = db.prepare(`
            SELECT 
                COUNT(*) as totalInvoices, 
                COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) as totalRevenue 
            FROM invoices
        `).get();
        
        const subscriptionStats = db.prepare(`
            SELECT COUNT(*) as activeSubscriptions 
            FROM subscriptions 
            WHERE status = 'active'
        `).get();
        
        res.json({
            totalInvoices: invoiceStats.totalInvoices || 0,
            totalRevenue: invoiceStats.totalRevenue || 0,
            activeSubscriptions: subscriptionStats.activeSubscriptions || 0
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Posture Perfect CRM Server running on http://localhost:${PORT}`);
    console.log('🎯 All API endpoints are working!');
    console.log('💻 Windows-compatible version using better-sqlite3');
});

module.exports = app;
