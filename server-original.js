require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize persistent database
const dbPath = process.env.DB_PATH || './crm.db';
const db = new sqlite3.Database(dbPath);

// Enhanced error logging
const logError = (error, context = '') => {
    const timestamp = new Date().toISOString();
    const errorMsg = `[${timestamp}] ERROR ${context}: ${error.message || error}`;
    console.error(errorMsg);
    if (error.stack) {
        console.error(error.stack);
    }
};

// Initialize database schema and dummy data
const initializeDatabase = () => {
    const schemaPath = path.join(__dirname, 'database-schema.sql');
    const dummyDataPath = path.join(__dirname, 'dummy-data-complete.sql');
    
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').filter(stmt => stmt.trim());
        
        db.serialize(() => {
            statements.forEach(statement => {
                if (statement.trim()) {
                    db.run(statement.trim(), (err) => {
                        if (err && !err.message.includes('already exists')) {
                            logError(err, 'Schema initialization');
                        }
                    });
                }
            });
            
            // Load dummy data
            if (fs.existsSync(dummyDataPath)) {
                const dummyData = fs.readFileSync(dummyDataPath, 'utf8');
                const dummyStatements = dummyData.split(';').filter(stmt => stmt.trim());
                
                dummyStatements.forEach(statement => {
                    if (statement.trim()) {
                        db.run(statement.trim(), (err) => {
                            if (err) {
                                logError(err, 'Dummy data insertion');
                            }
                        });
                    }
                });
                console.log('✅ Database initialized with dummy data');
            }
        });
    } else {
        logError(new Error('Database schema file not found'), 'Initialization');
    }
};

// Initialize database on startup
initializeDatabase();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    logError(err, `${req.method} ${req.path}`);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// CONTACTS API
app.get('/api/contacts', (req, res) => {
    console.log('📞 Fetching contacts...');
    db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            logError(err, 'GET /api/contacts');
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Found ${rows.length} contacts`);
        res.json(rows);
    });
});

app.get('/api/contacts/:id', (req, res) => {
    console.log(`📞 Fetching contact ${req.params.id}...`);
    db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            logError(err, `GET /api/contacts/${req.params.id}`);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            console.log(`❌ Contact ${req.params.id} not found`);
            return res.status(404).json({ error: 'Contact not found' });
        }
        console.log(`✅ Found contact: ${row.first_name} ${row.last_name}`);
        res.json(row);
    });
});

app.post('/api/contacts', (req, res) => {
    console.log('📞 Creating new contact...');
    const { first_name, last_name, email, phone, primary_complaint, status, referred_by } = req.body;
    if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: 'First name, last name, and email are required' });
    }
    
    db.run(`INSERT INTO contacts (first_name, last_name, email, phone, primary_complaint, status, referred_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [first_name, last_name, email, phone, primary_complaint, status || 'Lead', referred_by], 
        function(err) {
            if (err) {
                logError(err, 'POST /api/contacts');
                return res.status(500).json({ error: err.message });
            }
            console.log(`✅ Created contact: ${first_name} ${last_name} (ID: ${this.lastID})`);
            res.json({ id: this.lastID, message: 'Contact created successfully' });
        });
});

app.put('/api/contacts/:id', (req, res) => {
    console.log(`📞 Updating contact ${req.params.id}...`);
    const { first_name, last_name, email, phone, primary_complaint, status, source } = req.body;
    
    db.run(`UPDATE contacts SET 
            first_name = ?, last_name = ?, email = ?, phone = ?, 
            primary_complaint = ?, status = ?, source = ?
            WHERE id = ?`,
        [first_name, last_name, email, phone, primary_complaint, status, source, req.params.id],
        function(err) {
            if (err) {
                logError(err, `PUT /api/contacts/${req.params.id}`);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Contact not found' });
            }
            res.json({ message: 'Contact updated successfully' });
        });
});

app.delete('/api/contacts/:id', (req, res) => {
    console.log(`📞 Deleting contact ${req.params.id}...`);
    
    db.run('DELETE FROM contacts WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            logError(err, `DELETE /api/contacts/${req.params.id}`);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json({ message: 'Contact deleted successfully' });
    });
});

// APPOINTMENTS API
app.get('/api/appointments', (req, res) => {
    console.log('📅 Fetching appointments...');
    db.all(`SELECT a.*, c.first_name, c.last_name, c.email 
            FROM appointments a 
            JOIN contacts c ON a.contact_id = c.id 
            ORDER BY a.appointment_date DESC, a.appointment_time DESC`, [], (err, rows) => {
        if (err) {
            logError(err, 'GET /api/appointments');
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Found ${rows.length} appointments`);
        res.json(rows);
    });
});

app.post('/api/appointments', (req, res) => {
    console.log('📅 Creating new appointment...');
    const { contact_id, appointment_date, appointment_time, service_type, notes, status } = req.body;
    if (!contact_id || !appointment_date || !appointment_time || !service_type) {
        return res.status(400).json({ error: 'Contact ID, date, time, and service type are required' });
    }
    
    db.run(`INSERT INTO appointments (contact_id, appointment_date, appointment_time, service_type, notes, status) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
        [contact_id, appointment_date, appointment_time, service_type, notes, status || 'Scheduled'], 
        function(err) {
            if (err) {
                logError(err, 'POST /api/appointments');
                return res.status(500).json({ error: err.message });
            }
            console.log(`✅ Created appointment (ID: ${this.lastID})`);
            res.json({ id: this.lastID, message: 'Appointment created successfully' });
        });
});

// INVOICES API
app.get('/api/invoices', (req, res) => {
    console.log('💰 Fetching invoices...');
    db.all(`SELECT i.*, c.first_name, c.last_name, c.email 
            FROM invoices i 
            JOIN contacts c ON i.contact_id = c.id 
            ORDER BY i.created_at DESC`, [], (err, rows) => {
        if (err) {
            logError(err, 'GET /api/invoices');
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Found ${rows.length} invoices`);
        res.json(rows);
    });
});

app.post('/api/invoices', (req, res) => {
    console.log('💰 Creating new invoice...');
    const { contact_id, service_description, amount, invoice_date, due_date, status } = req.body;
    if (!contact_id || !service_description || !amount || !invoice_date || !due_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    db.run(`INSERT INTO invoices (contact_id, service_description, amount, invoice_date, due_date, status) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
        [contact_id, service_description, amount, invoice_date, due_date, status || 'Sent'], 
        function(err) {
            if (err) {
                logError(err, 'POST /api/invoices');
                return res.status(500).json({ error: err.message });
            }
            console.log(`✅ Created invoice (ID: ${this.lastID})`);
            res.json({ id: this.lastID, message: 'Invoice created successfully' });
        });
});

// TREATMENT PLANS API
app.get('/api/treatment-plans', (req, res) => {
    console.log('📋 Fetching treatment plans...');
    db.all('SELECT * FROM treatment_plans ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            logError(err, 'GET /api/treatment-plans');
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Found ${rows.length} treatment plans`);
        res.json(rows);
    });
});

app.post('/api/treatment-plans', (req, res) => {
    console.log('📋 Creating new treatment plan...');
    const { name, description, duration_weeks, sessions_per_week, price_per_session } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
    }
    
    db.run(`INSERT INTO treatment_plans (name, description, duration_weeks, sessions_per_week, price_per_session) 
            VALUES (?, ?, ?, ?, ?)`, 
        [name, description, duration_weeks, sessions_per_week, price_per_session], 
        function(err) {
            if (err) {
                logError(err, 'POST /api/treatment-plans');
                return res.status(500).json({ error: err.message });
            }
            console.log(`✅ Created treatment plan: ${name} (ID: ${this.lastID})`);
            res.json({ id: this.lastID, message: 'Treatment plan created successfully' });
        });
});

// ADMIN API
app.get('/api/admin/users', (req, res) => {
    console.log('👥 Fetching users...');
    db.all('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            logError(err, 'GET /api/admin/users');
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Found ${rows.length} users`);
        res.json(rows);
    });
});

app.post('/api/admin/users', (req, res) => {
    console.log('👥 Creating new user...');
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    // Simple password hash for demo (use bcrypt in production)
    const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    db.run(`INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
        [username, email, hashedPassword, role || 'user'], 
        function(err) {
            if (err) {
                logError(err, 'POST /api/admin/users');
                return res.status(500).json({ error: err.message });
            }
            console.log(`✅ Created user: ${username} (ID: ${this.lastID})`);
            res.json({ id: this.lastID, message: 'User created successfully' });
        });
});

// FINANCIAL ANALYTICS API
app.get('/api/admin/analytics/financial', (req, res) => {
    console.log('📊 Fetching financial analytics...');
    const queries = [
        'SELECT COUNT(*) as total_users FROM users',
        'SELECT COUNT(*) as total_patients FROM contacts',
        'SELECT COUNT(*) as total_appointments FROM appointments',
        'SELECT COALESCE(SUM(amount), 0) as total_revenue FROM invoices WHERE status = "Paid"',
        'SELECT COUNT(*) as pending_invoices FROM invoices WHERE status = "Sent"',
        'SELECT COALESCE(SUM(amount), 0) as outstanding_amount FROM invoices WHERE status != "Paid"'
    ];
    
    let results = {};
    let completed = 0;
    
    queries.forEach((query, index) => {
        db.get(query, [], (err, row) => {
            if (err) {
                logError(err, `Analytics query ${index}`);
            } else {
                Object.assign(results, row);
            }
            completed++;
            if (completed === queries.length) {
                console.log('✅ Financial analytics compiled');
                res.json(results);
            }
        });
    });
});

// REPORTS API
app.get('/api/reports/leads-per-month', (req, res) => {
    console.log('📈 Fetching leads per month...');
    db.all(`SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
            FROM contacts 
            GROUP BY strftime('%Y-%m', created_at) 
            ORDER BY month DESC LIMIT 12`, [], (err, rows) => {
        if (err) {
            logError(err, 'GET /api/reports/leads-per-month');
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Found ${rows.length} months of lead data`);
        res.json(rows);
    });
});

app.get('/api/reports/conversion-rate', (req, res) => {
    console.log('📈 Fetching conversion rate...');
    db.all(`SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Client' THEN 1 ELSE 0 END) as converted,
                ROUND(SUM(CASE WHEN status = 'Client' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as rate
            FROM contacts`, [], (err, rows) => {
        if (err) {
            logError(err, 'GET /api/reports/conversion-rate');
            return res.status(500).json({ error: err.message });
        }
        console.log('✅ Conversion rate calculated');
        res.json(rows[0] || { total: 0, converted: 0, rate: 0 });
    });
});

app.get('/api/reports/revenue-per-month', (req, res) => {
    console.log('📈 Fetching revenue per month...');
    db.all(`SELECT strftime('%Y-%m', invoice_date) as month, SUM(amount) as revenue 
            FROM invoices 
            WHERE status = 'Paid'
            GROUP BY strftime('%Y-%m', invoice_date) 
            ORDER BY month DESC LIMIT 12`, [], (err, rows) => {
        if (err) {
            logError(err, 'GET /api/reports/revenue-per-month');
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Found ${rows.length} months of revenue data`);
        res.json(rows);
    });
});

// PATIENT PROFILE ENDPOINTS
app.get('/api/patients/:id/timeline', (req, res) => {
    console.log(`👤 Fetching timeline for patient ${req.params.id}...`);
    const queries = [
        `SELECT 'assessment' as type, id, assessment_date as date, chief_complaint as description, created_at FROM patient_assessments WHERE contact_id = ?`,
        `SELECT 'session' as type, id, session_date as date, session_type as description, created_at FROM patient_sessions WHERE contact_id = ?`,
        `SELECT 'appointment' as type, id, appointment_date as date, service_type as description, created_at FROM appointments WHERE contact_id = ?`
    ];
    
    let allEvents = [];
    let completed = 0;
    
    queries.forEach(query => {
        db.all(query, [req.params.id], (err, rows) => {
            if (err) {
                logError(err, `Timeline query for patient ${req.params.id}`);
            } else {
                allEvents = allEvents.concat(rows);
            }
            completed++;
            if (completed === queries.length) {
                allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
                console.log(`✅ Found ${allEvents.length} timeline events`);
                res.json(allEvents);
            }
        });
    });
});

// Serve static files
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    db.close((err) => {
        if (err) {
            logError(err, 'Database close');
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Database: ${dbPath}`);
    console.log('🔓 Authentication disabled - direct access enabled');
    console.log('📊 Enhanced debugging enabled');
});
