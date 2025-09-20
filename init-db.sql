-- Create contacts table
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    primary_complaint TEXT,
    status TEXT CHECK(status IN ('Lead', 'Client', 'Past Client')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
