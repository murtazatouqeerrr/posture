const nodemailer = require('nodemailer');

// CONFIGURE THE TRANSPORTER USING YOUR SMTP DETAILS
const transporter = nodemailer.createTransport({
    host: 'your_smtp_host', // e.g., 'smtp.gmail.com'
    port: 587, // or 465 for SSL
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'your_smtp_username',
        pass: 'your_smtp_password'
    }
});

async function sendEmail(to, subject, html) {
    try {
        const mailOptions = {
            from: '"Posture Perfect CRM" <your_from_email@example.com>',
            to: to, // recipient
            subject: subject, // Subject line
            html: html, // html body
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error };
    }
}

module.exports = { sendEmail };
