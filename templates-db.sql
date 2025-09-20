-- Create treatment_plans table
CREATE TABLE treatment_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    duration TEXT,
    price DECIMAL(10,2),
    template_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
