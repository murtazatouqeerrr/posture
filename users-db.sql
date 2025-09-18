-- Create users table for authentication
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'therapist' CHECK(role IN ('admin', 'therapist')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
