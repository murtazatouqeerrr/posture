// Module 3: Automated Nudge System (Core Automation)
const fs = require('fs');
const path = require('path');

// Nudge System Functions
class NudgeAutomation {
    constructor() {
        this.dbPath = path.join(__dirname, 'enhanced_db.json');
    }

    readDB() {
        return JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
    }

    writeDB(data) {
        fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    }

    getNextId(table) {
        const db = this.readDB();
        const ids = db[table].map(item => item.id);
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }

    // A. Low Sessions Warning (sessions_remaining < 3)
    checkLowSessionsWarning() {
        const db = this.readDB();
        const lowSessionPackages = db.patient_packages.filter(pp => 
            pp.is_active && pp.sessions_remaining < 3 && pp.sessions_remaining > 0
        );

        lowSessionPackages.forEach(package => {
            const patient = db.contacts.find(c => c.id === package.patient_id);
            if (!patient) return;

            // Check if we already sent a low sessions warning recently
            const recentWarning = db.automated_emails.find(email => 
                email.patient_id === package.patient_id && 
                email.email_type === 'low_sessions_warning' &&
                new Date(email.sent_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Within last 7 days
            );

            if (!recentWarning) {
                this.sendLowSessionsWarning(patient, package);
            }
        });

        return lowSessionPackages.length;
    }

    sendLowSessionsWarning(patient, package) {
        const db = this.readDB();
        const emailId = this.getNextId('automated_emails');
        
        const emailContent = `
            Hi ${patient.first_name},
            
            Heads up! You only have ${package.sessions_remaining} sessions left in your current package.
            
            Don't let your progress stop here! Click the link below to renew and secure your spot:
            https://postureperect.com/renew-package?patient=${patient.id}
            
            Questions? Reply to this email or call us at (555) 123-4567.
            
            Best regards,
            Posture Perfect Team
        `;

        db.automated_emails.push({
            id: emailId,
            patient_id: patient.id,
            email_type: 'low_sessions_warning',
            sent_at: new Date().toISOString(),
            status: 'sent',
            email_content: emailContent,
            trigger_data: {
                sessions_remaining: package.sessions_remaining,
                package_id: package.id
            }
        });

        this.writeDB(db);
        console.log(`📧 Low sessions warning sent to ${patient.first_name} ${patient.last_name} (${package.sessions_remaining} sessions left)`);
    }

    // B. Package Complete & Renewal (sessions_remaining == 0)
    checkPackageCompleteRenewal() {
        const db = this.readDB();
        const completedPackages = db.patient_packages.filter(pp => 
            pp.sessions_remaining === 0 && pp.is_active
        );

        completedPackages.forEach(package => {
            const patient = db.contacts.find(c => c.id === package.patient_id);
            if (!patient) return;

            // Check if we already sent a renewal email for this package
            const renewalSent = db.automated_emails.find(email => 
                email.patient_id === package.patient_id && 
                email.email_type === 'package_renewal' &&
                email.trigger_data && email.trigger_data.package_id === package.id
            );

            if (!renewalSent) {
                this.sendPackageRenewalEmail(patient, package);
                // Mark package as inactive
                package.is_active = false;
            }
        });

        this.writeDB(db);
        return completedPackages.length;
    }

    sendPackageRenewalEmail(patient, package) {
        const db = this.readDB();
        const emailId = this.getNextId('automated_emails');
        
        const emailContent = `
            Congratulations ${patient.first_name}!
            
            You've completed your ${package.total_sessions}-session package! We hope you're feeling the difference in your posture and overall well-being.
            
            Ready to continue your journey? Choose your next package:
            https://postureperect.com/packages?patient=${patient.id}
            
            🎯 Keep the momentum going with our:
            • 6-Session Maintenance Package
            • 12-Session Advanced Program  
            • 24-Session Complete Transformation
            
            Book your next session today!
            
            Best regards,
            Posture Perfect Team
        `;

        db.automated_emails.push({
            id: emailId,
            patient_id: patient.id,
            email_type: 'package_renewal',
            sent_at: new Date().toISOString(),
            status: 'sent',
            email_content: emailContent,
            trigger_data: {
                completed_package_id: package.id,
                package_id: package.id
            }
        });

        this.writeDB(db);
        console.log(`🎉 Package renewal email sent to ${patient.first_name} ${patient.last_name}`);
    }

    // C. Dormant Patient Re-activation (No appointment for 45 days)
    checkDormantPatients() {
        const db = this.readDB();
        const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
        
        const dormantPatients = db.contacts.filter(patient => {
            if (patient.status !== 'Client') return false;

            // Check if they have any recent appointments
            const recentAppointment = db.appointments.find(apt => 
                apt.patient_id === patient.id && 
                new Date(apt.appointment_date) > fortyFiveDaysAgo
            );

            // Check if they have any active packages
            const activePackage = db.patient_packages.find(pp => 
                pp.patient_id === patient.id && pp.is_active
            );

            return !recentAppointment && !activePackage;
        });

        dormantPatients.forEach(patient => {
            // Check if we already sent a dormant reactivation email recently
            const recentReactivation = db.automated_emails.find(email => 
                email.patient_id === patient.id && 
                email.email_type === 'dormant_reactivation' &&
                new Date(email.sent_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Within last 30 days
            );

            if (!recentReactivation) {
                this.sendDormantReactivationEmail(patient);
                // Update patient status to dormant
                patient.status = 'Dormant';
            }
        });

        this.writeDB(db);
        return dormantPatients.length;
    }

    sendDormantReactivationEmail(patient) {
        const db = this.readDB();
        const emailId = this.getNextId('automated_emails');
        
        const emailContent = `
            Hi ${patient.first_name},
            
            We miss you at Posture Perfect! It's been a while since your last visit, and we wanted to check in.
            
            How has your posture been? Are you keeping up with the exercises we worked on together?
            
            🎁 Special Welcome Back Offer:
            Book a session this month and get 20% off your next package!
            
            We're here to help you continue your posture journey. Reply to this email or call us at (555) 123-4567 to schedule.
            
            Looking forward to seeing you again!
            
            Best regards,
            Posture Perfect Team
            
            P.S. If you'd prefer not to receive these emails, just let us know.
        `;

        db.automated_emails.push({
            id: emailId,
            patient_id: patient.id,
            email_type: 'dormant_reactivation',
            sent_at: new Date().toISOString(),
            status: 'sent',
            email_content: emailContent,
            trigger_data: {
                incentive: '20% off next package',
                days_inactive: 45
            }
        });

        this.writeDB(db);
        console.log(`💤 Dormant reactivation email sent to ${patient.first_name} ${patient.last_name}`);
    }

    // Run all nudge checks
    runDailyNudgeChecks() {
        console.log('🤖 Running daily nudge automation checks...');
        
        const lowSessionsCount = this.checkLowSessionsWarning();
        const renewalCount = this.checkPackageCompleteRenewal();
        const dormantCount = this.checkDormantPatients();
        
        console.log(`✅ Nudge automation complete:`);
        console.log(`   📧 Low sessions warnings: ${lowSessionsCount}`);
        console.log(`   🎉 Renewal emails: ${renewalCount}`);
        console.log(`   💤 Dormant reactivations: ${dormantCount}`);
        
        return {
            low_sessions: lowSessionsCount,
            renewals: renewalCount,
            dormant: dormantCount,
            timestamp: new Date().toISOString()
        };
    }
}

// Cron Job Setup
function setupNudgeCronJobs() {
    const nudgeSystem = new NudgeAutomation();
    
    // Run daily at 9 AM
    const cron = require('node-cron');
    
    cron.schedule('0 9 * * *', () => {
        nudgeSystem.runDailyNudgeChecks();
    });
    
    console.log('⏰ Nudge automation cron job scheduled for 9 AM daily');
    
    // For testing, also allow manual trigger
    return nudgeSystem;
}

// API Endpoints for nudge system
const nudgeAPI = {
    // Manual trigger for testing
    triggerNudgeChecks: (req, res) => {
        const nudgeSystem = new NudgeAutomation();
        const results = nudgeSystem.runDailyNudgeChecks();
        res.json({ success: true, results });
    },

    // Get nudge history
    getNudgeHistory: (req, res) => {
        const nudgeSystem = new NudgeAutomation();
        const db = nudgeSystem.readDB();
        
        const nudgeEmails = db.automated_emails.filter(email => 
            ['low_sessions_warning', 'package_renewal', 'dormant_reactivation'].includes(email.email_type)
        );
        
        res.json(nudgeEmails);
    },

    // Get patient nudge status
    getPatientNudgeStatus: (req, res) => {
        const patientId = parseInt(req.params.id);
        const nudgeSystem = new NudgeAutomation();
        const db = nudgeSystem.readDB();
        
        const patientEmails = db.automated_emails.filter(email => 
            email.patient_id === patientId &&
            ['low_sessions_warning', 'package_renewal', 'dormant_reactivation'].includes(email.email_type)
        );
        
        const activePackage = db.patient_packages.find(pp => 
            pp.patient_id === patientId && pp.is_active
        );
        
        res.json({
            patient_id: patientId,
            active_package: activePackage,
            nudge_emails: patientEmails,
            needs_low_session_warning: activePackage && activePackage.sessions_remaining < 3,
            needs_renewal: activePackage && activePackage.sessions_remaining === 0
        });
    }
};

module.exports = { NudgeAutomation, setupNudgeCronJobs, nudgeAPI };

// If run directly, set up cron jobs
if (require.main === module) {
    const nudgeSystem = setupNudgeCronJobs();
    
    // Run once immediately for testing
    console.log('🧪 Running initial nudge check...');
    nudgeSystem.runDailyNudgeChecks();
}
