-- Add assigned_to column to appointments table for therapist assignment (only if not exists)
ALTER TABLE appointments ADD COLUMN assigned_to INTEGER REFERENCES users(id);

-- Update existing appointments with dummy therapist assignments (only if not already set)
UPDATE appointments SET assigned_to = 1 WHERE id IN (1, 3) AND assigned_to IS NULL;
UPDATE appointments SET assigned_to = 2 WHERE id IN (2, 4) AND assigned_to IS NULL;
