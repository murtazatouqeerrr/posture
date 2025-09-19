const express = require('express');
const bcrypt = require('bcryptjs');

function createPatientRouter(db) {
    const router = express.Router();

    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        db.get('SELECT * FROM patient_logins WHERE email = ?', [email], (err, patient) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!patient) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const passwordIsValid = bcrypt.compareSync(password, patient.password_hash);
            if (!passwordIsValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // In a real application, you would create a session here
            res.json({ message: 'Login successful' });
        });
    });

    router.get('/:id/appointments', (req, res) => {
        db.all('SELECT * FROM appointments WHERE contact_id = ?', [req.params.id], (err, rows) => {
            if (err) {
                res.status(500).json({error: err.message});
                return;
            }
            res.json(rows);
        });
    });

    router.get('/availability', (req, res) => {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // This is a mock implementation. In a real application, you would check the calendar for real availability.
        const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        db.all('SELECT strftime(\'%H:%M\', date_time) as time FROM appointments WHERE date(date_time) = ?', [date], (err, rows) => {
            if (err) {
                res.status(500).json({error: err.message});
                return;
            }
            const bookedSlots = rows.map(r => r.time);
            const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));
            res.json(availableSlots);
        });
    });

    router.post('/book-appointment', (req, res) => {
        const { service, date, time_slot } = req.body;
        if (!service || !date || !time_slot) {
            return res.status(400).json({ error: 'Service, date, and time slot are required' });
        }

        const dateTime = `${date} ${time_slot}`;
        // In a real application, you would get the contact_id from the logged-in patient's session
        const contact_id = 1; // Hardcoded for now

        db.run('INSERT INTO appointments (contact_id, date_time, type) VALUES (?, ?, ?)', [contact_id, dateTime, service], function(err) {
            if (err) {
                res.status(500).json({error: err.message});
                return;
            }
            res.json({ id: this.lastID, message: 'Appointment booked successfully' });
        });
    });

    return router;
}

module.exports = createPatientRouter;
