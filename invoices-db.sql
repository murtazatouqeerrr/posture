-- Create invoices table
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    amount DECIMAL(10,2),
    status TEXT CHECK(status IN ('Sent', 'Paid', 'Overdue')),
    due_date DATE,
    services_rendered TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
