-- Add missing subscription tables
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_interval TEXT NOT NULL,
    features TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    plan_id INTEGER,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Add templates table for email/document templates
CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    variables TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add reports table
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add automation_rules table
CREATE TABLE IF NOT EXISTS automation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    conditions TEXT,
    actions TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add pre_visit_checklist table
CREATE TABLE IF NOT EXISTS pre_visit_checklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    checklist_data TEXT,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
