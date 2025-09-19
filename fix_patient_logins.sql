-- Add missing patient_logins table
CREATE TABLE IF NOT EXISTS patient_logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- Add sample patient login for Emily Johnson
INSERT OR IGNORE INTO patient_logins (contact_id, email, password_hash) 
VALUES (100, 'emily.johnson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
