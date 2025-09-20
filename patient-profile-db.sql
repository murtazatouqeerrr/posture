-- Create patient_assessments table
CREATE TABLE patient_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    assessment_date DATETIME,
    therapist_notes TEXT,
    observed_posture TEXT,
    recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES contacts(id)
);

-- Create patient_sessions table
CREATE TABLE patient_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    session_date DATETIME,
    type TEXT,
    notes TEXT,
    pain_level_pre INTEGER CHECK(pain_level_pre >= 1 AND pain_level_pre <= 10),
    pain_level_post INTEGER CHECK(pain_level_post >= 1 AND pain_level_post <= 10),
    homework_assigned TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES contacts(id)
);
