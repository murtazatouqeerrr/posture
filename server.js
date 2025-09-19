const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize in-memory database
const db = new sqlite3.Database(':memory:');

// Initialize database schema
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Contacts table
    db.run(`CREATE TABLE contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        primary_complaint TEXT,
        status TEXT DEFAULT 'Lead',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Appointments table
    db.run(`CREATE TABLE appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        service_type TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'Scheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
    )`);

    // Invoices table
    db.run(`CREATE TABLE invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        service_description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        invoice_date DATE NOT NULL,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'Sent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
    )`);

    // Treatment plans table
    db.run(`CREATE TABLE treatment_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        duration_weeks INTEGER DEFAULT 4,
        sessions_per_week INTEGER DEFAULT 2,
        price_per_session DECIMAL(10,2) DEFAULT 100.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert sample data
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
        ['admin', 'admin@example.com', hashedPassword, 'admin']);

    db.run(`INSERT INTO contacts (first_name, last_name, email, phone, primary_complaint, status) VALUES 
        ('John', 'Smith', 'john@email.com', '555-0101', 'Lower back pain', 'Client'),
        ('Sarah', 'Wilson', 'sarah@email.com', '555-0102', 'Neck pain', 'Lead'),
        ('Mike', 'Brown', 'mike@email.com', '555-0103', 'Shoulder pain', 'Client')`);

    db.run(`INSERT INTO treatment_plans (name, description, duration_weeks, sessions_per_week, price_per_session) VALUES 
        ('Basic Physical Therapy', 'Standard rehabilitation program', 6, 2, 120.00),
        ('Advanced Recovery', 'Intensive therapy for complex cases', 8, 3, 150.00),
        ('Maintenance Program', 'Ongoing support and prevention', 4, 1, 80.00)`);
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

// CONTACTS API
app.get('/api/contacts', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/contacts/:id', (req, res) => {
    db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Contact not found' });
        res.json(row);
    });
});

app.post('/api/contacts', (req, res) => {
    const { first_name, last_name, email, phone, primary_complaint, status } = req.body;
    if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: 'First name, last name, and email are required' });
    }
    
    db.run(`INSERT INTO contacts (first_name, last_name, email, phone, primary_complaint, status) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
        [first_name, last_name, email, phone, primary_complaint, status], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Contact created successfully' });
        });
});

app.put('/api/contacts/:id', (req, res) => {
    const { first_name, last_name, email, phone, primary_complaint, status } = req.body;
    db.run(`UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ?, primary_complaint = ?, status = ? 
            WHERE id = ?`, 
        [first_name, last_name, email, phone, primary_complaint, status, req.params.id], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Contact not found' });
            res.json({ message: 'Contact updated successfully' });
        });
});

app.delete('/api/contacts/:id', (req, res) => {
    db.run('DELETE FROM contacts WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Contact not found' });
        res.json({ message: 'Contact deleted successfully' });
    });
});

// APPOINTMENTS API
app.get('/api/appointments', (req, res) => {
    db.all('SELECT * FROM appointments ORDER BY appointment_date DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/appointments/:id', (req, res) => {
    db.get('SELECT * FROM appointments WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Appointment not found' });
        res.json(row);
    });
});

app.post('/api/appointments', (req, res) => {
    const { contact_id, appointment_date, appointment_time, service_type, notes, status } = req.body;
    if (!contact_id || !appointment_date || !appointment_time || !service_type) {
        return res.status(400).json({ error: 'Contact ID, date, time, and service type are required' });
    }
    
    db.run(`INSERT INTO appointments (contact_id, appointment_date, appointment_time, service_type, notes, status) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
        [contact_id, appointment_date, appointment_time, service_type, notes, status || 'Scheduled'], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Appointment created successfully' });
        });
});

app.put('/api/appointments/:id', (req, res) => {
    const { contact_id, appointment_date, appointment_time, service_type, notes, status } = req.body;
    db.run(`UPDATE appointments SET contact_id = ?, appointment_date = ?, appointment_time = ?, service_type = ?, notes = ?, status = ? 
            WHERE id = ?`, 
        [contact_id, appointment_date, appointment_time, service_type, notes, status, req.params.id], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Appointment not found' });
            res.json({ message: 'Appointment updated successfully' });
        });
});

app.delete('/api/appointments/:id', (req, res) => {
    db.run('DELETE FROM appointments WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Appointment not found' });
        res.json({ message: 'Appointment deleted successfully' });
    });
});

// INVOICES API
app.get('/api/invoices', (req, res) => {
    db.all('SELECT * FROM invoices ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/invoices/:id', (req, res) => {
    db.get('SELECT * FROM invoices WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Invoice not found' });
        res.json(row);
    });
});

app.post('/api/invoices', (req, res) => {
    const { contact_id, service_description, amount, invoice_date, due_date, status } = req.body;
    if (!contact_id || !service_description || !amount || !invoice_date || !due_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    db.run(`INSERT INTO invoices (contact_id, service_description, amount, invoice_date, due_date, status) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
        [contact_id, service_description, amount, invoice_date, due_date, status || 'Sent'], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Invoice created successfully' });
        });
});

app.put('/api/invoices/:id', (req, res) => {
    const { contact_id, service_description, amount, invoice_date, due_date, status } = req.body;
    db.run(`UPDATE invoices SET contact_id = ?, service_description = ?, amount = ?, invoice_date = ?, due_date = ?, status = ? 
            WHERE id = ?`, 
        [contact_id, service_description, amount, invoice_date, due_date, status, req.params.id], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Invoice not found' });
            res.json({ message: 'Invoice updated successfully' });
        });
});

app.delete('/api/invoices/:id', (req, res) => {
    db.run('DELETE FROM invoices WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Invoice not found' });
        res.json({ message: 'Invoice deleted successfully' });
    });
});

// TREATMENT PLANS API
app.get('/api/treatment-plans', (req, res) => {
    db.all('SELECT * FROM treatment_plans ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/treatment-plans/:id', (req, res) => {
    db.get('SELECT * FROM treatment_plans WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Treatment plan not found' });
        res.json(row);
    });
});

app.post('/api/treatment-plans', (req, res) => {
    const { name, description, duration_weeks, sessions_per_week, price_per_session } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
    }
    
    db.run(`INSERT INTO treatment_plans (name, description, duration_weeks, sessions_per_week, price_per_session) 
            VALUES (?, ?, ?, ?, ?)`, 
        [name, description, duration_weeks, sessions_per_week, price_per_session], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Treatment plan created successfully' });
        });
});

app.put('/api/treatment-plans/:id', (req, res) => {
    const { name, description, duration_weeks, sessions_per_week, price_per_session } = req.body;
    db.run(`UPDATE treatment_plans SET name = ?, description = ?, duration_weeks = ?, sessions_per_week = ?, price_per_session = ? 
            WHERE id = ?`, 
        [name, description, duration_weeks, sessions_per_week, price_per_session, req.params.id], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Treatment plan not found' });
            res.json({ message: 'Treatment plan updated successfully' });
        });
});

app.delete('/api/treatment-plans/:id', (req, res) => {
    db.run('DELETE FROM treatment_plans WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Treatment plan not found' });
        res.json({ message: 'Treatment plan deleted successfully' });
    });
});

// ADMIN API
app.get('/api/admin/users', (req, res) => {
    db.all('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/users/:id', (req, res) => {
    db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'User not found' });
        res.json(row);
    });
});

app.post('/api/admin/users', (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
        [username, email, hashedPassword, role || 'user'], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'User created successfully' });
        });
});

app.put('/api/admin/users/:id', (req, res) => {
    const { username, email, password, role } = req.body;
    let query = 'UPDATE users SET username = ?, email = ?, role = ?';
    let params = [username, email, role, req.params.id];
    
    if (password) {
        query = 'UPDATE users SET username = ?, email = ?, password_hash = ?, role = ? WHERE id = ?';
        params = [username, email, bcrypt.hashSync(password, 10), role, req.params.id];
    } else {
        query += ' WHERE id = ?';
    }
    
    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated successfully' });
    });
});

app.delete('/api/admin/users/:id', (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    });
});

app.get('/api/admin/analytics/overview', (req, res) => {
    const queries = [
        'SELECT COUNT(*) as total_users FROM users',
        'SELECT COUNT(*) as total_patients FROM contacts',
        'SELECT COUNT(*) as total_appointments FROM appointments',
        'SELECT COALESCE(SUM(amount), 0) as total_revenue FROM invoices WHERE status = "Paid"'
    ];
    
    let results = {};
    let completed = 0;
    
    queries.forEach((query, index) => {
        db.get(query, [], (err, row) => {
            if (!err) {
                Object.assign(results, row);
            }
            completed++;
            if (completed === queries.length) {
                res.json(results);
            }
        });
    });
});

// REPORTS API
app.get('/api/reports/leads-per-month', (req, res) => {
    db.all(`SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
            FROM contacts 
            GROUP BY strftime('%Y-%m', created_at) 
            ORDER BY month DESC LIMIT 12`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/reports/conversion-rate', (req, res) => {
    db.all(`SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Client' THEN 1 ELSE 0 END) as converted,
                ROUND(SUM(CASE WHEN status = 'Client' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as rate
            FROM contacts`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows[0] || { total: 0, converted: 0, rate: 0 });
    });
});

app.get('/api/reports/revenue-per-month', (req, res) => {
    db.all(`SELECT strftime('%Y-%m', invoice_date) as month, SUM(amount) as revenue 
            FROM invoices 
            WHERE status = 'Paid'
            GROUP BY strftime('%Y-%m', invoice_date) 
            ORDER BY month DESC LIMIT 12`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Serve static files
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
