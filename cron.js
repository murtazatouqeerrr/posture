const cron = require('node-cron');
const { sendEmail } = require('./email.js');

function startCronJobs(db) {
    // Schedule a job to run every day at a specific time (e.g., 9:00 AM)
    cron.schedule('0 9 * * *', () => {
        console.log('Running daily campaign check...');
        sendScheduledCampaigns(db);
    });
}

async function sendScheduledCampaigns(db) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();

    // Fetch all active, scheduled campaigns
    db.all("SELECT * FROM campaigns WHERE status = 'active' AND schedule_type != 'manual'", [], (err, campaigns) => {
        if (err) {
            console.error('Error fetching scheduled campaigns:', err);
            return;
        }

        campaigns.forEach(campaign => {
            let shouldSend = false;
            if (campaign.schedule_type === 'daily') {
                shouldSend = true;
            } else if (campaign.schedule_type === 'weekly' && campaign.day_of_week == dayOfWeek) {
                shouldSend = true;
            } else if (campaign.schedule_type === 'monthly' && campaign.day_of_month == dayOfMonth) {
                shouldSend = true;
            }

            if (shouldSend) {
                console.log(`Sending scheduled campaign: ${campaign.name}`);
                // Fetch audience and messages, then send emails (similar to send now)
                let audienceQuery = 'SELECT * FROM contacts';
                if (campaign.target_audience === 'leads') {
                    audienceQuery += ' WHERE status = \'Lead\'';
                } else if (campaign.target_audience === 'clients') {
                    audienceQuery += ' WHERE status = \'Client\'';
                }

                db.all(audienceQuery, [], (err, contacts) => {
                    if (err) {
                        console.error('Error fetching contacts for scheduled campaign:', err);
                        return;
                    }

                    db.all('SELECT * FROM automated_messages WHERE campaign_id = ? ORDER BY sequence_order ASC', [campaign.id], async (err, messages) => {
                        if (err) {
                            console.error('Error fetching messages for scheduled campaign:', err);
                            return;
                        }

                        for (const contact of contacts) {
                            for (const message of messages) {
                                await sendEmail(contact.email, message.subject, message.body);
                            }
                        }
                    });
                });
            }
        });
    });
}

module.exports = { startCronJobs };
