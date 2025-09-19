const express = require('express');

function createInvoicesRouter(db) {
    const router = express.Router();

    router.get('/', (req, res) => {
        let query = 'SELECT * FROM invoices';
        let params = [];
        if (req.query.contact_id) {
            query += ' WHERE contact_id = ?';
            params.push(req.query.contact_id);
        }

        db.all(query, params, (err, rows) => {
            if (err) {
                res.status(500).json({error: err.message});
                return;
            }
            res.json(rows);
        });
    });

    router.get('/:id', (req, res) => {
        db.get('SELECT * FROM invoices WHERE id = ?', [req.params.id], (err, row) => {
            if (err) {
                res.status(500).json({error: err.message});
                return;
            }
            res.json(row);
        });
    });

    router.post('/', (req, res) => {
        const { contact_id, service_description, amount, due_date, status } = req.body;
        db.run(`INSERT INTO invoices (contact_id, service_description, amount, due_date, status) VALUES (?, ?, ?, ?, ?)`, 
            [contact_id, service_description, amount, due_date, status || 'Sent'], 
            function(err) {
                if (err) {
                    res.status(500).json({error: err.message});
                    return;
                }
                res.json({ id: this.lastID, message: 'Invoice created successfully' });
            }
        );
    });

    router.put('/:id', (req, res) => {
        const { service_description, amount, status, due_date } = req.body;
        db.run(`UPDATE invoices SET service_description = ?, amount = ?, status = ?, due_date = ? WHERE id = ?`, 
            [service_description, amount, status, due_date, req.params.id], 
            function(err) {
                if (err) {
                    res.status(500).json({error: err.message});
                    return;
                }
                res.json({ message: 'Invoice updated successfully' });
            }
        );
    });

    router.delete('/:id', (req, res) => {
        db.run('DELETE FROM invoices WHERE id = ?', req.params.id, function(err) {
            if (err) {
                res.status(500).json({error: err.message});
                return;
            }
            res.json({ message: 'Invoice deleted successfully' });
        });
    });

    return router;
}

module.exports = createInvoicesRouter;
