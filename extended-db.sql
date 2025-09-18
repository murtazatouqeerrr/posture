-- Create appointments table
CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    date_time DATETIME,
    type TEXT,
    notes TEXT,
    status TEXT CHECK(status IN ('Scheduled', 'Completed', 'Cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- Create tasks table
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    due_date DATE,
    associated_contact_id INTEGER,
    status TEXT CHECK(status IN ('Todo', 'Done')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (associated_contact_id) REFERENCES contacts(id)
);
