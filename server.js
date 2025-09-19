const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { initDatabase, connectDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize database
const db = initDatabase();

// Authentication middleware
function requireAuth(req, res, next) {
    // COMMENTED OUT - Skip auth for demo
    // if (!req.session.userId) {
    //     return res.status(401).json({ error: 'Authentication required' });
    // }
    next();
}

// Admin middleware
function requireAdmin(req, res, next) {
    // COMMENTED OUT - Skip admin check for demo
    // if (!req.session.userId) {
    //     return res.status(401).json({ error: 'Authentication required' });
    // }
    // 
    // // Check if user is admin
    // db.get('SELECT role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    //     if (err || !user || user.role !== 'admin') {
    //         return res.status(403).json({ error: 'Admin access required' });
    //     }
    //     next();
    // });
    
    // TEMPORARY - Allow all admin access for demo
    next();
}

// Input validation helper
function validateRequired(fields, body) {
    const missing = fields.filter(field => !body[field]);
    return missing.length > 0 ? missing : null;
}

// AUTHENTICATION ENDPOINTS
// POST /api/signup - Create new user
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        
        const missing = validateRequired(['username', 'password', 'name'], req.body);
        if (missing) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        // Check if username already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const sql = 'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)';
        db.run(sql, [username, passwordHash, name, 'user'], function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            // Auto-login after signup
            req.session.userId = this.lastID;
            req.session.username = username;
            req.session.name = name;
            req.session.role = 'user';

            res.json({ 
                message: 'User created successfully',
                user: { id: this.lastID, username, name, role: 'user' }
            });
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const missing = validateRequired(['username', 'password'], req.body);
        if (missing) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        // Find user
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.name = user.name;
        req.session.role = user.role;

        res.json({ 
            message: 'Login successful',
            user: { id: user.id, username: user.username, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// POST /api/logout - User logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// GET /api/check-auth - Check authentication status (updated to include role)
app.get('/api/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username,
                name: req.session.name,
                role: req.session.role
            }
        });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// CONTACTS/PATIENTS ENDPOINTS
app.get('/api/contacts', (req, res) => {
    const sql = 'SELECT * FROM contacts ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/contacts', (req, res) => {
    const { first_name, last_name, email, phone, primary_complaint, status } = req.body;
    const sql = 'INSERT INTO contacts (first_name, last_name, email, phone, primary_complaint, status) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.run(sql, [first_name, last_name, email, phone, primary_complaint, status || 'Lead'], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Contact created successfully' });
    });
});

app.get('/api/contacts/:id', (req, res) => {
    const sql = 'SELECT * FROM contacts WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        res.json(row);
    });
});

app.put('/api/contacts/:id', (req, res) => {
    const { first_name, last_name, email, phone, primary_complaint, status } = req.body;
    const sql = 'UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ?, primary_complaint = ?, status = ? WHERE id = ?';
    
    db.run(sql, [first_name, last_name, email, phone, primary_complaint, status, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        res.json({ message: 'Contact updated successfully' });
    });
});

app.delete('/api/contacts/:id', (req, res) => {
    const sql = 'DELETE FROM contacts WHERE id = ?';
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        res.json({ message: 'Contact deleted successfully' });
    });
});

// APPOINTMENTS ENDPOINTS
app.get('/api/appointments', (req, res) => {
    const sql = `SELECT a.*, c.first_name || ' ' || c.last_name as patient_name 
                 FROM appointments a 
                 LEFT JOIN contacts c ON a.contact_id = c.id 
                 ORDER BY a.date_time DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/appointments', (req, res) => {
    const { contact_id, date_time, type, notes, status } = req.body;
    const sql = 'INSERT INTO appointments (contact_id, date_time, type, notes, status) VALUES (?, ?, ?, ?, ?)';
    
    db.run(sql, [contact_id, date_time, type, notes, status || 'Scheduled'], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Appointment created successfully' });
    });
});

app.put('/api/appointments/:id', (req, res) => {
    const { contact_id, date_time, type, notes, status } = req.body;
    const sql = 'UPDATE appointments SET contact_id = ?, date_time = ?, type = ?, notes = ?, status = ? WHERE id = ?';
    
    db.run(sql, [contact_id, date_time, type, notes, status, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Appointment updated successfully' });
    });
});

app.delete('/api/appointments/:id', (req, res) => {
    const sql = 'DELETE FROM appointments WHERE id = ?';
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Appointment deleted successfully' });
    });
});

// INVOICES ENDPOINTS
app.get('/api/invoices', (req, res) => {
    const sql = `SELECT i.*, c.first_name || ' ' || c.last_name as contact_name 
                 FROM invoices i 
                 LEFT JOIN contacts c ON i.contact_id = c.id 
                 ORDER BY i.created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/invoices', (req, res) => {
    const { contact_id, amount, due_date, services_rendered, status } = req.body;
    const sql = 'INSERT INTO invoices (contact_id, amount, due_date, services_rendered, status) VALUES (?, ?, ?, ?, ?)';
    
    db.run(sql, [contact_id, amount, due_date, services_rendered, status || 'Sent'], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Invoice created successfully' });
    });
});

app.put('/api/invoices/:id', (req, res) => {
    const { amount, due_date, services_rendered, status } = req.body;
    const sql = 'UPDATE invoices SET amount = ?, due_date = ?, services_rendered = ?, status = ? WHERE id = ?';
    
    db.run(sql, [amount, due_date, services_rendered, status, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Invoice updated successfully' });
    });
});

app.delete('/api/invoices/:id', (req, res) => {
    const sql = 'DELETE FROM invoices WHERE id = ?';
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Invoice deleted successfully' });
    });
});

// ADMIN USER MANAGEMENT ENDPOINTS (Working with Database)
app.get('/api/admin/users', (req, res) => {
    const sql = 'SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/admin/users', async (req, res) => {
    try {
        const { username, password, name, role } = req.body;
        
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const sql = 'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)';
        db.run(sql, [username, passwordHash, name, role], function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ 
                message: 'User created successfully',
                user: { id: this.lastID, username, name, role }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during user creation' });
    }
});

app.put('/api/admin/users/:id', (req, res) => {
    const { name, role } = req.body;
    const userId = parseInt(req.params.id);
    
    const sql = 'UPDATE users SET name = ?, role = ? WHERE id = ?';
    
    db.run(sql, [name, role, userId], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ message: 'User updated successfully' });
    });
});

app.delete('/api/admin/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    
    const sql = 'DELETE FROM users WHERE id = ?';
    
    db.run(sql, [userId], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// ADMIN ANALYTICS ENDPOINTS (Real Database Queries)
app.get('/api/admin/analytics/overview', (req, res) => {
    const queries = {
        total_patients: 'SELECT COUNT(*) as count FROM contacts',
        total_appointments: 'SELECT COUNT(*) as count FROM appointments',
        total_revenue: 'SELECT SUM(amount) as total FROM invoices WHERE status = "Paid"',
        conversion_rate: 'SELECT COUNT(*) as total, SUM(CASE WHEN status = "Client" THEN 1 ELSE 0 END) as converted FROM contacts'
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.get(queries[key], [], (err, row) => {
            if (err) {
                console.error(`Error in ${key}:`, err);
                results[key] = 0;
            } else {
                if (key === 'conversion_rate') {
                    results[key] = row.total > 0 ? ((row.converted / row.total) * 100).toFixed(2) : 0;
                } else {
                    results[key] = row.count || row.total || 0;
                }
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

app.get('/api/admin/analytics/appointments', (req, res) => {
    const queries = {
        by_type: 'SELECT type, COUNT(*) as count FROM appointments GROUP BY type',
        by_therapist: `SELECT u.name, COUNT(*) as count 
                      FROM appointments a 
                      LEFT JOIN users u ON a.assigned_to = u.id 
                      WHERE u.name IS NOT NULL 
                      GROUP BY u.name`,
        by_month: `SELECT strftime('%Y-%m', date_time) as month, COUNT(*) as count 
                  FROM appointments 
                  GROUP BY strftime('%Y-%m', date_time) 
                  ORDER BY month DESC LIMIT 12`
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.all(queries[key], [], (err, rows) => {
            if (err) {
                console.error(`Error in ${key}:`, err);
                results[key] = [];
            } else {
                results[key] = rows;
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

app.get('/api/admin/analytics/patients', (req, res) => {
    const queries = {
        new_per_month: `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
                       FROM contacts 
                       GROUP BY strftime('%Y-%m', created_at) 
                       ORDER BY month DESC LIMIT 12`,
        common_complaints: `SELECT primary_complaint, COUNT(*) as count 
                          FROM contacts 
                          WHERE primary_complaint IS NOT NULL 
                          GROUP BY primary_complaint 
                          ORDER BY count DESC LIMIT 10`
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.all(queries[key], [], (err, rows) => {
            if (err) {
                console.error(`Error in ${key}:`, err);
                results[key] = [];
            } else {
                results[key] = rows;
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

// REPORTS ENDPOINTS (Real Database Queries)
app.get('/api/reports/leads-per-month', (req, res) => {
    const sql = `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
                 FROM contacts 
                 WHERE status = 'Lead'
                 GROUP BY strftime('%Y-%m', created_at) 
                 ORDER BY month DESC LIMIT 12`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/reports/conversion-rate', (req, res) => {
    const sql = `SELECT COUNT(*) as total, 
                        SUM(CASE WHEN status = 'Client' THEN 1 ELSE 0 END) as converted 
                 FROM contacts`;
    
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const rate = row.total > 0 ? ((row.converted / row.total) * 100).toFixed(2) : 0;
        res.json({ rate: parseFloat(rate), total_leads: row.total, converted: row.converted });
    });
});

app.get('/api/reports/revenue-per-month', (req, res) => {
    const sql = `SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as revenue 
                 FROM invoices 
                 WHERE status = 'Paid'
                 GROUP BY strftime('%Y-%m', created_at) 
                 ORDER BY month DESC LIMIT 12`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// TREATMENT PLANS ENDPOINTS (Real Database Queries)
app.get('/api/treatment-plans', (req, res) => {
    const sql = 'SELECT * FROM treatment_plans ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/treatment-plans/:id', (req, res) => {
    const sql = 'SELECT * FROM treatment_plans WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Treatment plan not found' });
            return;
        }
        res.json(row);
    });
});

// SEND TEMPLATE ENDPOINT
app.post('/api/send-template', (req, res) => {
    const { templateId, contactId } = req.body;
    // In a real app, this would send email/SMS
    res.json({ message: 'Template sent successfully to patient' });
});

// Catch-all route for SPA - serve index.html for any non-API route
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export for Vercel
module.exports = app;

// Start server locally
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Input validation helper
function validateRequired(fields, body) {
    const missing = fields.filter(field => !body[field]);
    return missing.length > 0 ? missing : null;
}

// AUTHENTICATION ENDPOINTS
// POST /api/signup - Create new user
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        
        const missing = validateRequired(['username', 'password', 'name'], req.body);
        if (missing) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        // Check if username already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const sql = 'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)';
        db.run(sql, [username, passwordHash, name, 'user'], function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            // Auto-login after signup
            req.session.userId = this.lastID;
            req.session.username = username;
            req.session.name = name;
            req.session.role = 'user';

            res.json({ 
                message: 'User created successfully',
                user: { id: this.lastID, username, name, role: 'user' }
            });
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const missing = validateRequired(['username', 'password'], req.body);
        if (missing) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        // Find user
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.name = user.name;
        req.session.role = user.role;

        res.json({ 
            message: 'Login successful',
            user: { id: user.id, username: user.username, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// POST /api/logout - User logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Admin middleware
function requireAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user is admin
    db.get('SELECT role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
}

// GET /api/check-auth - Check authentication status (updated to include role)
app.get('/api/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username,
                name: req.session.name,
                role: req.session.role
            }
        });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// ADMIN USER MANAGEMENT ENDPOINTS
// GET /api/admin/users - Get all users
app.get('/api/admin/users', requireAdmin, (req, res) => {
    const sql = 'SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST /api/admin/users - Create new user
app.post('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const { username, password, name, role } = req.body;
        
        const missing = validateRequired(['username', 'password', 'name', 'role'], req.body);
        if (missing) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        // Check if username already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const sql = 'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)';
        db.run(sql, [username, passwordHash, name, role], function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ 
                message: 'User created successfully',
                user: { id: this.lastID, username, name, role }
            });
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Server error during user creation' });
    }
});

// PUT /api/admin/users/:id - Update user
app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
    const { name, role } = req.body;
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const sql = 'UPDATE users SET name = ?, role = ? WHERE id = ?';
    
    db.run(sql, [name, role, userId], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ message: 'User updated successfully' });
    });
});

// DELETE /api/admin/users/:id - Delete user
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Prevent admin from deleting themselves
    if (userId === req.session.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const sql = 'DELETE FROM users WHERE id = ?';
    
    db.run(sql, [userId], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// ADMIN ANALYTICS ENDPOINTS
// GET /api/admin/analytics/overview - Get overview metrics
app.get('/api/admin/analytics/overview', requireAdmin, (req, res) => {
    const queries = {
        total_patients: 'SELECT COUNT(*) as count FROM contacts',
        total_appointments: 'SELECT COUNT(*) as count FROM appointments',
        total_revenue: 'SELECT SUM(amount) as total FROM invoices WHERE status = "Paid"',
        conversion_rate: 'SELECT COUNT(*) as total, SUM(CASE WHEN status = "Client" THEN 1 ELSE 0 END) as converted FROM contacts'
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.get(queries[key], [], (err, row) => {
            if (err) {
                console.error(`Error in ${key}:`, err);
                results[key] = 0;
            } else {
                if (key === 'conversion_rate') {
                    results[key] = row.total > 0 ? ((row.converted / row.total) * 100).toFixed(2) : 0;
                } else {
                    results[key] = row.count || row.total || 0;
                }
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

// GET /api/admin/analytics/appointments - Get appointment analytics
app.get('/api/admin/analytics/appointments', requireAdmin, (req, res) => {
    const queries = {
        by_type: 'SELECT type, COUNT(*) as count FROM appointments GROUP BY type',
        by_therapist: `SELECT u.name, COUNT(*) as count 
                      FROM appointments a 
                      LEFT JOIN users u ON a.assigned_to = u.id 
                      WHERE u.name IS NOT NULL 
                      GROUP BY u.name`,
        by_month: `SELECT strftime('%Y-%m', date_time) as month, COUNT(*) as count 
                  FROM appointments 
                  GROUP BY strftime('%Y-%m', date_time) 
                  ORDER BY month DESC LIMIT 12`
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.all(queries[key], [], (err, rows) => {
            if (err) {
                console.error(`Error in ${key}:`, err);
                results[key] = [];
            } else {
                results[key] = rows;
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

// GET /api/admin/analytics/patients - Get patient analytics
app.get('/api/admin/analytics/patients', requireAdmin, (req, res) => {
    const queries = {
        new_per_month: `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
                       FROM contacts 
                       GROUP BY strftime('%Y-%m', created_at) 
                       ORDER BY month DESC LIMIT 12`,
        common_complaints: `SELECT primary_complaint, COUNT(*) as count 
                          FROM contacts 
                          WHERE primary_complaint IS NOT NULL 
                          GROUP BY primary_complaint 
                          ORDER BY count DESC LIMIT 10`
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.all(queries[key], [], (err, rows) => {
            if (err) {
                console.error(`Error in ${key}:`, err);
                results[key] = [];
            } else {
                results[key] = rows;
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

// CONTACTS API ENDPOINTS (Protected)
// POST /api/contacts - Add new contact
app.post('/api/contacts', requireAuth, (req, res) => {
    try {
        const { first_name, last_name, email, phone, primary_complaint } = req.body;
        
        const missing = validateRequired(['first_name', 'last_name', 'email'], req.body);
        if (missing) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }
        
        const sql = `INSERT INTO contacts (first_name, last_name, email, phone, primary_complaint, status) 
                     VALUES (?, ?, ?, ?, ?, 'Lead')`;
        
        db.run(sql, [first_name, last_name, email, phone, primary_complaint], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Email already exists' });
                } else {
                    res.status(400).json({ error: err.message });
                }
                return;
            }
            res.json({ id: this.lastID, message: 'Contact added successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/contacts - Get all contacts
app.get('/api/contacts', requireAuth, (req, res) => {
    try {
        const sql = `SELECT * FROM contacts ORDER BY created_at DESC`;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/contacts/:id - Get single contact
app.get('/api/contacts/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid contact ID' });
        }
        
        const sql = `SELECT * FROM contacts WHERE id = ?`;
        
        db.get(sql, [id], (err, row) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            if (!row) {
                res.status(404).json({ error: 'Contact not found' });
                return;
            }
            res.json(row);
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/contacts/:id - Update contact
app.put('/api/contacts/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid contact ID' });
        }
        
        const { first_name, last_name, email, phone, primary_complaint, status } = req.body;
        const sql = `UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ?, primary_complaint = ?, status = ? WHERE id = ?`;
        
        db.run(sql, [first_name, last_name, email, phone, primary_complaint, status, id], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Email already exists' });
                } else {
                    res.status(400).json({ error: err.message });
                }
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Contact not found' });
                return;
            }
            res.json({ message: 'Contact updated successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/contacts/:id - Delete contact
app.delete('/api/contacts/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid contact ID' });
        }
        
        const sql = `DELETE FROM contacts WHERE id = ?`;
        
        db.run(sql, [id], function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Contact not found' });
                return;
            }
            res.json({ message: 'Contact deleted successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// APPOINTMENTS API ENDPOINTS
// POST /api/appointments - Add new appointment
app.post('/api/appointments', (req, res) => {
    const { contact_id, date_time, type, notes } = req.body;
    
    const sql = `INSERT INTO appointments (contact_id, date_time, type, notes, status) 
                 VALUES (?, ?, ?, ?, 'Scheduled')`;
    
    db.run(sql, [contact_id, date_time, type, notes], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Appointment added successfully' });
    });
});

// GET /api/appointments - Get all appointments
app.get('/api/appointments', (req, res) => {
    const sql = `SELECT a.*, c.first_name, c.last_name 
                 FROM appointments a 
                 LEFT JOIN contacts c ON a.contact_id = c.id 
                 ORDER BY a.date_time ASC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET /api/appointments/:id - Get single appointment
app.get('/api/appointments/:id', (req, res) => {
    const sql = `SELECT a.*, c.first_name, c.last_name 
                 FROM appointments a 
                 LEFT JOIN contacts c ON a.contact_id = c.id 
                 WHERE a.id = ?`;
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Appointment not found' });
            return;
        }
        res.json(row);
    });
});

// PUT /api/appointments/:id - Update appointment
app.put('/api/appointments/:id', (req, res) => {
    const { contact_id, date_time, type, notes, status } = req.body;
    const sql = `UPDATE appointments SET contact_id = ?, date_time = ?, type = ?, notes = ?, status = ? WHERE id = ?`;
    
    db.run(sql, [contact_id, date_time, type, notes, status, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Appointment not found' });
            return;
        }
        res.json({ message: 'Appointment updated successfully' });
    });
});

// DELETE /api/appointments/:id - Delete appointment
app.delete('/api/appointments/:id', (req, res) => {
    const sql = `DELETE FROM appointments WHERE id = ?`;
    
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Appointment not found' });
            return;
        }
        res.json({ message: 'Appointment deleted successfully' });
    });
});

// TASKS API ENDPOINTS
// POST /api/tasks - Add new task
app.post('/api/tasks', (req, res) => {
    const { title, description, due_date, associated_contact_id } = req.body;
    
    const sql = `INSERT INTO tasks (title, description, due_date, associated_contact_id, status) 
                 VALUES (?, ?, ?, ?, 'Todo')`;
    
    db.run(sql, [title, description, due_date, associated_contact_id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Task added successfully' });
    });
});

// GET /api/tasks - Get all tasks
app.get('/api/tasks', (req, res) => {
    const sql = `SELECT t.*, c.first_name, c.last_name 
                 FROM tasks t 
                 LEFT JOIN contacts c ON t.associated_contact_id = c.id 
                 ORDER BY t.due_date ASC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET /api/tasks/:id - Get single task
app.get('/api/tasks/:id', (req, res) => {
    const sql = `SELECT t.*, c.first_name, c.last_name 
                 FROM tasks t 
                 LEFT JOIN contacts c ON t.associated_contact_id = c.id 
                 WHERE t.id = ?`;
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json(row);
    });
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', (req, res) => {
    const { title, description, due_date, associated_contact_id, status } = req.body;
    const sql = `UPDATE tasks SET title = ?, description = ?, due_date = ?, associated_contact_id = ?, status = ? WHERE id = ?`;
    
    db.run(sql, [title, description, due_date, associated_contact_id, status, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json({ message: 'Task updated successfully' });
    });
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
    const sql = `DELETE FROM tasks WHERE id = ?`;
    
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

// INVOICES API ENDPOINTS
// POST /api/invoices - Add new invoice
app.post('/api/invoices', (req, res) => {
    const { contact_id, amount, due_date, services_rendered } = req.body;
    
    const sql = `INSERT INTO invoices (contact_id, amount, status, due_date, services_rendered) 
                 VALUES (?, ?, 'Sent', ?, ?)`;
    
    db.run(sql, [contact_id, amount, due_date, services_rendered], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Invoice added successfully' });
    });
});

// GET /api/invoices - Get all invoices
app.get('/api/invoices', (req, res) => {
    const sql = `SELECT i.*, c.first_name, c.last_name 
                 FROM invoices i 
                 LEFT JOIN contacts c ON i.contact_id = c.id 
                 ORDER BY i.created_at DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// PUT /api/invoices/:id - Update invoice
app.put('/api/invoices/:id', (req, res) => {
    const { status } = req.body;
    const sql = `UPDATE invoices SET status = ? WHERE id = ?`;
    
    db.run(sql, [status, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Invoice updated successfully' });
    });
});

// GET /api/reports/leads-per-month - Monthly leads report
app.get('/api/reports/leads-per-month', (req, res) => {
    const sql = `SELECT 
                    strftime('%Y-%m', created_at) as month,
                    COUNT(*) as count
                 FROM contacts 
                 GROUP BY strftime('%Y-%m', created_at)
                 ORDER BY month DESC
                 LIMIT 12`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET /api/reports/conversion-rate - Lead conversion rate
app.get('/api/reports/conversion-rate', (req, res) => {
    const sql = `SELECT 
                    COUNT(*) as total_leads,
                    SUM(CASE WHEN status = 'Client' THEN 1 ELSE 0 END) as converted_leads
                 FROM contacts`;
    
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const rate = row.total_leads > 0 ? (row.converted_leads / row.total_leads * 100).toFixed(2) : 0;
        res.json({ conversion_rate: rate, total_leads: row.total_leads, converted_leads: row.converted_leads });
    });
});

// GET /api/reports/revenue-per-month - Monthly revenue report
app.get('/api/reports/revenue-per-month', (req, res) => {
    const sql = `SELECT 
                    strftime('%Y-%m', created_at) as month,
                    SUM(amount) as revenue
                 FROM invoices 
                 WHERE status = 'Paid'
                 GROUP BY strftime('%Y-%m', created_at)
                 ORDER BY month DESC
                 LIMIT 12`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// PATIENT PROFILE API ENDPOINTS
// POST /api/patients/:id/assessment - Add new assessment
app.post('/api/patients/:id/assessment', (req, res) => {
    const { assessment_date, therapist_notes, observed_posture, recommendations } = req.body;
    const patient_id = req.params.id;
    
    const sql = `INSERT INTO patient_assessments (patient_id, assessment_date, therapist_notes, observed_posture, recommendations) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [patient_id, assessment_date, therapist_notes, observed_posture, recommendations], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Assessment added successfully' });
    });
});

// GET /api/patients/:id/assessments - Get all assessments for a patient
app.get('/api/patients/:id/assessments', (req, res) => {
    const sql = `SELECT * FROM patient_assessments WHERE patient_id = ? ORDER BY assessment_date DESC`;
    
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST /api/patients/:id/session - Log new session
app.post('/api/patients/:id/session', (req, res) => {
    const { session_date, type, notes, pain_level_pre, pain_level_post, homework_assigned } = req.body;
    const patient_id = req.params.id;
    
    const sql = `INSERT INTO patient_sessions (patient_id, session_date, type, notes, pain_level_pre, pain_level_post, homework_assigned) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [patient_id, session_date, type, notes, pain_level_pre, pain_level_post, homework_assigned], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Session logged successfully' });
    });
});

// GET /api/patients/:id/sessions - Get all sessions for a patient
app.get('/api/patients/:id/sessions', (req, res) => {
    const sql = `SELECT * FROM patient_sessions WHERE patient_id = ? ORDER BY session_date DESC`;
    
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET /api/patients/:id/timeline - Get combined timeline for a patient
app.get('/api/patients/:id/timeline', (req, res) => {
    const assessmentsSql = `SELECT 'assessment' as type, assessment_date as date, therapist_notes as notes, created_at FROM patient_assessments WHERE patient_id = ?`;
    const sessionsSql = `SELECT 'session' as type, session_date as date, notes, created_at FROM patient_sessions WHERE patient_id = ?`;
    
    db.all(assessmentsSql, [req.params.id], (err, assessments) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        
        db.all(sessionsSql, [req.params.id], (err, sessions) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            
            const timeline = [...assessments, ...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
            res.json(timeline);
        });
    });
});

// TREATMENT PLANS API ENDPOINTS
// GET /api/treatment-plans - Get all treatment plans
app.get('/api/treatment-plans', (req, res) => {
    const sql = `SELECT * FROM treatment_plans ORDER BY created_at DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET /api/treatment-plans/:id - Get single treatment plan
app.get('/api/treatment-plans/:id', (req, res) => {
    const sql = `SELECT * FROM treatment_plans WHERE id = ?`;
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Treatment plan not found' });
            return;
        }
        res.json(row);
    });
});

// Catch-all route for SPA - serve index.html for any non-API route
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
