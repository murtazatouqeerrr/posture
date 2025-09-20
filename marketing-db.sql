
-- Database Schema for Marketing & Automation Engine
-- Phase 3

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    target_audience TEXT NOT NULL, -- e.g., 'all', 'leads', 'clients'
    channel TEXT NOT NULL, -- 'email' or 'sms'
    status TEXT DEFAULT 'draft', -- 'draft', 'active', 'archived'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Automated Messages Table (for drip campaigns)
CREATE TABLE IF NOT EXISTS automated_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    subject TEXT, -- For email
    body TEXT NOT NULL,
    delay_days INTEGER DEFAULT 0, -- Days to wait before sending after a trigger
    sequence_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);
