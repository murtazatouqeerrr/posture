-- Enhanced Database Schema for Posture Perfect CRM
-- Phase 2: Financial Powerhouse

-- Users table (existing)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table (existing)
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    primary_complaint TEXT,
    status TEXT DEFAULT 'Lead',
    stripe_customer_id TEXT,
    referred_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES contacts(id)
);

-- Appointments table (existing)
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    service_type TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- Enhanced Invoices table with Stripe integration
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    service_description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'Sent',
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- Treatment plans table (existing)
CREATE TABLE IF NOT EXISTS treatment_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_weeks INTEGER DEFAULT 4,
    sessions_per_week INTEGER DEFAULT 2,
    price_per_session DECIMAL(10,2) DEFAULT 100.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- New: Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_interval TEXT NOT NULL, -- 'week', 'month', 'year'
    sessions_included INTEGER DEFAULT 0,
    stripe_price_id TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- New: Customer Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'unpaid'
    current_period_start DATE,
    current_period_end DATE,
    cancel_at_period_end BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- New: Payment Methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    stripe_payment_method_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'card', 'bank_account'
    last_four TEXT,
    brand TEXT,
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- New: Patient Assessments table
CREATE TABLE IF NOT EXISTS patient_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    assessment_date DATE NOT NULL,
    chief_complaint TEXT,
    pain_level INTEGER CHECK(pain_level >= 0 AND pain_level <= 10),
    functional_goals TEXT,
    medical_history TEXT,
    current_medications TEXT,
    therapist_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- New: Patient Sessions table
CREATE TABLE IF NOT EXISTS patient_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    session_date DATE NOT NULL,
    session_type TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    pre_session_pain INTEGER CHECK(pre_session_pain >= 0 AND pre_session_pain <= 10),
    post_session_pain INTEGER CHECK(post_session_pain >= 0 AND post_session_pain <= 10),
    treatments_performed TEXT,
    homework_assigned TEXT,
    therapist_notes TEXT,
    next_session_goals TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- New: Audit Log table for HIPAA compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_values TEXT, -- JSON string
    new_values TEXT, -- JSON string
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert sample subscription plans
INSERT OR IGNORE INTO subscription_plans (name, description, price, billing_interval, sessions_included) VALUES 
('Weekly Session Plan', 'One session per week with ongoing support', 120.00, 'week', 1),
('Bi-Weekly Plan', 'Two sessions per week for intensive recovery', 220.00, 'week', 2),
('Monthly Maintenance', 'Monthly check-in and maintenance session', 100.00, 'month', 1),
('Premium Monthly', 'Unlimited sessions with premium care', 400.00, 'month', 0);

-- Insert sample data if not exists
INSERT OR IGNORE INTO users (id, username, email, password_hash, role) VALUES 
(1, 'admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT OR IGNORE INTO contacts (first_name, last_name, email, phone, primary_complaint, status) VALUES 
('John', 'Smith', 'john@email.com', '555-0101', 'Lower back pain', 'Client'),
('Sarah', 'Wilson', 'sarah@email.com', '555-0102', 'Neck pain', 'Lead'),
('Mike', 'Brown', 'mike@email.com', '555-0103', 'Shoulder pain', 'Client');

-- Patient Logins table
CREATE TABLE IF NOT EXISTS patient_logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

INSERT OR IGNORE INTO treatment_plans (name, description, duration_weeks, sessions_per_week, price_per_session) VALUES 
('Basic Physical Therapy', 'Standard rehabilitation program', 6, 2, 120.00),
('Advanced Recovery', 'Intensive therapy for complex cases', 8, 3, 150.00),
('Maintenance Program', 'Ongoing support and prevention', 4, 1, 80.00);

-- Add sample patient login
INSERT OR IGNORE INTO patient_logins (contact_id, email, password_hash) VALUES 
(100, 'emily.johnson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
