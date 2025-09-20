-- Fix admin password (hash for 'admin123')
UPDATE users SET password_hash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.jjAXBfWMZmtUB8Z1fSOHSRG6zV8W' WHERE username = 'admin';

-- If admin doesn't exist, create it
INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES 
('admin', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.jjAXBfWMZmtUB8Z1fSOHSRG6zV8W', 'System Administrator', 'admin');
