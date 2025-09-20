const express = require('express');

function createCampaignsRouter(db) {
    const router = express.Router();

    // MARKETING & AUTOMATION API
    router.get('/', (req, res) => {
        db.all('SELECT * FROM campaigns ORDER BY created_at DESC', [], (err, campaigns) => {
            if (err) {
                console.error('Error fetching campaigns:', err);
                return res.status(500).json({ error: 'Failed to retrieve campaigns' });
            }
            res.json(campaigns || []);
        });
    });

    router.post('/', (req, res) => {
        const { name, description, target_audience, channel, status, schedule_type, day_of_week, day_of_month } = req.body;
        if (!name || !target_audience || !channel) {
            return res.status(400).json({ error: 'Missing required fields: name, target_audience, channel' });
        }

        const stmt = db.prepare('INSERT INTO campaigns (name, description, target_audience, channel, status, schedule_type, day_of_week, day_of_month) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        stmt.run(name, description, target_audience, channel, status || 'draft', schedule_type, day_of_week, day_of_month, function(err) {
            if (err) {
                console.error('Error creating campaign:', err);
                return res.status(500).json({ error: 'Failed to create campaign' });
            }
            res.status(201).json({ id: this.lastID, message: 'Campaign created successfully' });
        });
    });

    router.get('/:id', (req, res) => {
        db.get('SELECT * FROM campaigns WHERE id = ?', [req.params.id], (err, campaign) => {
            if (err) {
                console.error('Error fetching campaign:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            res.json(campaign);
        });
    });

    router.put('/:id', (req, res) => {
        const { name, description, target_audience, channel, status } = req.body;
        if (!name || !target_audience || !channel) {
            return res.status(400).json({ error: 'Missing required fields: name, target_audience, channel' });
        }

        const stmt = db.prepare('UPDATE campaigns SET name = ?, description = ?, target_audience = ?, channel = ?, status = ? WHERE id = ?');
        stmt.run(name, description, target_audience, channel, status, req.params.id, function(err) {
            if (err) {
                console.error('Error updating campaign:', err);
                return res.status(500).json({ error: 'Failed to update campaign' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            res.json({ message: 'Campaign updated successfully' });
        });
    });

    router.delete('/:id', (req, res) => {
        // First, delete associated messages
        db.run('DELETE FROM automated_messages WHERE campaign_id = ?', [req.params.id], (err) => {
            if (err) {
                console.error('Error deleting associated messages:', err);
                return res.status(500).json({ error: 'Failed to delete campaign messages' });
            }

            // Then, delete the campaign
            db.run('DELETE FROM campaigns WHERE id = ?', [req.params.id], function(err) {
                if (err) {
                    console.error('Error deleting campaign:', err);
                    return res.status(500).json({ error: 'Failed to delete campaign' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Campaign not found' });
                }
                res.json({ message: 'Campaign and associated messages deleted successfully' });
            });
        });
    });

    // AUTOMATED MESSAGES API
    router.get('/:id/messages', (req, res) => {
        db.all('SELECT * FROM automated_messages WHERE campaign_id = ? ORDER BY sequence_order ASC', [req.params.id], (err, messages) => {
            if (err) {
                console.error('Error fetching messages:', err);
                return res.status(500).json({ error: 'Failed to retrieve messages' });
            }
            res.json(messages);
        });
    });

    router.post('/:id/messages', (req, res) => {
        const campaignId = req.params.id;
        const { subject, body, delay_days, sequence_order } = req.body;
        if (!body || !delay_days || !sequence_order) {
            return res.status(400).json({ error: 'Missing required fields: body, delay_days, sequence_order' });
        }

        const stmt = db.prepare('INSERT INTO automated_messages (campaign_id, subject, body, delay_days, sequence_order) VALUES (?, ?, ?, ?, ?)');
        stmt.run(campaignId, subject, body, delay_days, sequence_order, function(err) {
            if (err) {
                console.error('Error creating message:', err);
                return res.status(500).json({ error: 'Failed to create message' });
            }
            res.status(201).json({ id: this.lastID, message: 'Message created successfully' });
        });
    });

    router.put('/messages/:id', (req, res) => {
        const { subject, body, delay_days, sequence_order } = req.body;
        if (!body || !delay_days || !sequence_order) {
            return res.status(400).json({ error: 'Missing required fields: body, delay_days, sequence_order' });
        }

        const stmt = db.prepare('UPDATE automated_messages SET subject = ?, body = ?, delay_days = ?, sequence_order = ? WHERE id = ?');
        stmt.run(subject, body, delay_days, sequence_order, req.params.id, function(err) {
            if (err) {
                console.error('Error updating message:', err);
                return res.status(500).json({ error: 'Failed to update message' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Message not found' });
            }
            res.json({ message: 'Message updated successfully' });
        });
    });

    router.delete('/messages/:id', (req, res) => {
        db.run('DELETE FROM automated_messages WHERE id = ?', [req.params.id], function(err) {
            if (err) {
                console.error('Error deleting message:', err);
                return res.status(500).json({ error: 'Failed to delete message' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Message not found' });
            }
            res.json({ message: 'Message deleted successfully' });
        });
    });

    router.post('/:id/send', async (req, res) => {
        const campaignId = req.params.id;
        
        db.get('SELECT * FROM campaigns WHERE id = ?', [campaignId], async (err, campaign) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }

            let audienceQuery = 'SELECT * FROM contacts';
            if (campaign.target_audience === 'leads') {
                audienceQuery += ' WHERE status = \'Lead\'';
            } else if (campaign.target_audience === 'clients') {
                audienceQuery += ' WHERE status = \'Client\'';
            }

            db.all(audienceQuery, [], async (err, contacts) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch contacts' });
                }

                db.all('SELECT * FROM automated_messages WHERE campaign_id = ? ORDER BY sequence_order ASC', [campaignId], async (err, messages) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to fetch messages' });
                    }

                    const { sendEmail } = require('../email.js');
                    let emailsSent = 0;

                    for (const contact of contacts) {
                        for (const message of messages) {
                            await sendEmail(contact.email, message.subject, message.body);
                            emailsSent++;
                        }
                    }

                    res.json({ message: `${emailsSent} emails sent successfully.` });
                });
            });
        });
    });

    return router;
}

module.exports = createCampaignsRouter;
