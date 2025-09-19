const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./crm.db');

// Sample patient data
const samplePatient = {
    first_name: 'Emily',
    last_name: 'Johnson',
    email: 'emily.johnson@email.com',
    phone: '555-0199',
    primary_complaint: 'Chronic lower back pain and sciatica',
    status: 'Client'
};

// Sample assessment
const sampleAssessment = {
    assessment_date: '2024-01-15',
    chief_complaint: 'Chronic lower back pain radiating to left leg, started 6 months ago after lifting heavy box',
    pain_level: 7,
    functional_goals: 'Return to work without pain, ability to sit for 2+ hours, resume jogging',
    medical_history: 'No previous back injuries, occasional headaches, no surgeries',
    current_medications: 'Ibuprofen 400mg as needed, Multivitamin',
    therapist_notes: 'Patient presents with limited lumbar flexion, positive straight leg raise test on left. Recommending 2x/week sessions for 8 weeks.'
};

// Sample sessions
const sampleSessions = [
    {
        session_date: '2024-01-18',
        session_type: 'Initial Treatment',
        duration_minutes: 60,
        pre_session_pain: 7,
        post_session_pain: 5,
        treatments_performed: 'Manual therapy, lumbar mobilization, core strengthening exercises',
        homework_assigned: 'Pelvic tilts 2x10, walking 15 minutes daily, ice 15 minutes after activity',
        therapist_notes: 'Good response to manual therapy. Patient motivated and compliant.',
        next_session_goals: 'Continue mobilization, progress core exercises'
    },
    {
        session_date: '2024-01-22',
        session_type: 'Follow-up Treatment',
        duration_minutes: 45,
        pre_session_pain: 6,
        post_session_pain: 4,
        treatments_performed: 'Spinal manipulation, therapeutic exercises, heat therapy',
        homework_assigned: 'Bridge exercises 2x15, cat-cow stretches, continue walking program',
        therapist_notes: 'Improved range of motion. Pain decreasing. Patient reports better sleep.',
        next_session_goals: 'Add functional movements, assess work ergonomics'
    }
];

// Sample appointment
const sampleAppointment = {
    appointment_date: '2024-01-25',
    appointment_time: '14:00',
    service_type: 'Physical Therapy Session',
    notes: 'Continue current treatment plan, assess progress',
    status: 'Scheduled'
};

// Sample invoice
const sampleInvoice = {
    service_description: 'Physical Therapy Session - Initial Assessment and Treatment',
    amount: 150.00,
    invoice_date: '2024-01-18',
    due_date: '2024-02-18',
    status: 'Paid',
    payment_method: 'Credit Card'
};

try {
    // Insert patient
    db.run(`
        INSERT INTO contacts (first_name, last_name, email, phone, primary_complaint, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        samplePatient.first_name,
        samplePatient.last_name,
        samplePatient.email,
        samplePatient.phone,
        samplePatient.primary_complaint,
        samplePatient.status
    ], function(err) {
        if (err) {
            console.error('❌ Error inserting patient:', err.message);
            return;
        }
        
        const patientId = this.lastID;
        console.log(`✅ Sample patient created with ID: ${patientId}`);
        
        // Insert assessment
        db.run(`
            INSERT INTO patient_assessments (contact_id, assessment_date, chief_complaint, pain_level, functional_goals, medical_history, current_medications, therapist_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            patientId,
            sampleAssessment.assessment_date,
            sampleAssessment.chief_complaint,
            sampleAssessment.pain_level,
            sampleAssessment.functional_goals,
            sampleAssessment.medical_history,
            sampleAssessment.current_medications,
            sampleAssessment.therapist_notes
        ], function(err) {
            if (err) console.error('❌ Error inserting assessment:', err.message);
            else console.log('✅ Sample assessment added');
        });
        
        // Insert sessions
        sampleSessions.forEach((session, index) => {
            db.run(`
                INSERT INTO patient_sessions (contact_id, session_date, session_type, duration_minutes, pre_session_pain, post_session_pain, treatments_performed, homework_assigned, therapist_notes, next_session_goals)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                patientId,
                session.session_date,
                session.session_type,
                session.duration_minutes,
                session.pre_session_pain,
                session.post_session_pain,
                session.treatments_performed,
                session.homework_assigned,
                session.therapist_notes,
                session.next_session_goals
            ], function(err) {
                if (err) console.error(`❌ Error inserting session ${index + 1}:`, err.message);
                else console.log(`✅ Sample session ${index + 1} added`);
            });
        });
        
        // Insert appointment
        db.run(`
            INSERT INTO appointments (contact_id, appointment_date, appointment_time, service_type, notes, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            patientId,
            sampleAppointment.appointment_date,
            sampleAppointment.appointment_time,
            sampleAppointment.service_type,
            sampleAppointment.notes,
            sampleAppointment.status
        ], function(err) {
            if (err) console.error('❌ Error inserting appointment:', err.message);
            else console.log('✅ Sample appointment added');
        });
        
        // Insert invoice
        db.run(`
            INSERT INTO invoices (contact_id, service_description, amount, invoice_date, due_date, status, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            patientId,
            sampleInvoice.service_description,
            sampleInvoice.amount,
            sampleInvoice.invoice_date,
            sampleInvoice.due_date,
            sampleInvoice.status,
            sampleInvoice.payment_method
        ], function(err) {
            if (err) console.error('❌ Error inserting invoice:', err.message);
            else console.log('✅ Sample invoice added');
        });
        
        // Display patient info
        setTimeout(() => {
            db.get('SELECT * FROM contacts WHERE id = ?', [patientId], (err, patient) => {
                if (err) {
                    console.error('❌ Error retrieving patient:', err.message);
                    return;
                }
                
                console.log('\n📋 SAMPLE PATIENT DETAILS:');
                console.log('==========================');
                console.log(`Name: ${patient.first_name} ${patient.last_name}`);
                console.log(`Email: ${patient.email}`);
                console.log(`Phone: ${patient.phone}`);
                console.log(`Primary Complaint: ${patient.primary_complaint}`);
                console.log(`Status: ${patient.status}`);
                console.log(`Patient ID: ${patient.id}`);
                
                // Check admin user
                db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, admin) => {
                    if (err) {
                        console.error('❌ Error checking admin:', err.message);
                        return;
                    }
                    
                    if (admin) {
                        console.log('\n🔐 LOGIN CREDENTIALS:');
                        console.log('=====================');
                        console.log('Username: admin');
                        console.log('Password: password');
                        console.log('Email: admin@example.com');
                    } else {
                        // Create admin user
                        const hashedPassword = bcrypt.hashSync('password', 10);
                        db.run(`
                            INSERT INTO users (username, email, password_hash, role)
                            VALUES (?, ?, ?, ?)
                        `, ['admin', 'admin@example.com', hashedPassword, 'admin'], function(err) {
                            if (err) {
                                console.error('❌ Error creating admin:', err.message);
                            } else {
                                console.log('\n🔐 ADMIN USER CREATED:');
                                console.log('======================');
                                console.log('Username: admin');
                                console.log('Password: password');
                                console.log('Email: admin@example.com');
                            }
                        });
                    }
                    
                    console.log('\n🚀 You can now access the patient dashboard at: http://localhost:3000');
                    db.close();
                });
            });
        }, 1000);
    });
    
} catch (error) {
    console.error('❌ Error adding sample data:', error.message);
}
