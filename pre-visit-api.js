const fs = require('fs');
const path = require('path');

// JSON Database helper functions
function readDB() {
    const dbPath = path.join(__dirname, 'enhanced_db.json');
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDB(data) {
    const dbPath = path.join(__dirname, 'enhanced_db.json');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function getNextId(table) {
    const db = readDB();
    const ids = db[table].map(item => item.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

// Pre-Visit Automation Functions
function triggerPreVisitAutomation(patientId) {
    const db = readDB();
    const patient = db.contacts.find(c => c.id === patientId);
    
    if (!patient) return { error: 'Patient not found' };

    // Initialize pre_visit_status if not exists
    if (!patient.pre_visit_status) {
        patient.pre_visit_status = {
            intake_forms_sent: false,
            intake_forms_completed: false,
            cc_on_file: false,
            first_appointment_scheduled: false
        };
    }

    // 1. Send intake forms email
    if (!patient.pre_visit_status.intake_forms_sent) {
        const emailId = getNextId('automated_emails');
        db.automated_emails.push({
            id: emailId,
            patient_id: patientId,
            email_type: 'intake_forms',
            sent_at: new Date().toISOString(),
            status: 'sent',
            email_content: `Welcome to Posture Perfect! Please complete your intake forms at: https://forms.postureperect.com/intake/${patientId}`
        });

        patient.pre_visit_status.intake_forms_sent = true;
    }

    // 2. Create CC on file task
    if (!patient.pre_visit_status.cc_on_file) {
        const taskId = getNextId('onboarding_tasks');
        db.onboarding_tasks.push({
            id: taskId,
            patient_id: patientId,
            task_type: 'cc_on_file',
            status: 'pending',
            created_at: new Date().toISOString(),
            completed_at: null,
            notes: 'Call patient to collect credit card information for file'
        });
    }

    // 3. Schedule first appointment task
    if (!patient.pre_visit_status.first_appointment_scheduled) {
        const taskId = getNextId('onboarding_tasks');
        db.onboarding_tasks.push({
            id: taskId,
            patient_id: patientId,
            task_type: 'first_appointment_scheduled',
            status: 'pending',
            created_at: new Date().toISOString(),
            completed_at: null,
            notes: 'Schedule initial assessment appointment'
        });
    }

    writeDB(db);
    return { success: true, message: 'Pre-visit automation triggered' };
}

// API Endpoints for Express.js
const preVisitRoutes = {
    // Trigger pre-visit automation when lead converts to client
    triggerAutomation: (req, res) => {
        const { patientId } = req.params;
        const result = triggerPreVisitAutomation(parseInt(patientId));
        
        if (result.error) {
            return res.status(404).json(result);
        }
        res.json(result);
    },

    // Get pre-visit checklist for a patient
    getPreVisitChecklist: (req, res) => {
        const { patientId } = req.params;
        const db = readDB();
        const patient = db.contacts.find(c => c.id === parseInt(patientId));
        
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const tasks = db.onboarding_tasks.filter(t => t.patient_id === parseInt(patientId));
        const emails = db.automated_emails.filter(e => e.patient_id === parseInt(patientId));
        
        res.json({
            patient_id: patientId,
            pre_visit_status: patient.pre_visit_status || {},
            tasks: tasks,
            emails: emails
        });
    },

    // Update task status
    updateTaskStatus: (req, res) => {
        const { taskId } = req.params;
        const { status, notes } = req.body;
        const db = readDB();
        
        const task = db.onboarding_tasks.find(t => t.id === parseInt(taskId));
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        task.status = status;
        if (notes) task.notes = notes;
        if (status === 'completed') {
            task.completed_at = new Date().toISOString();
            
            // Update patient pre_visit_status
            const patient = db.contacts.find(c => c.id === task.patient_id);
            if (patient && patient.pre_visit_status) {
                patient.pre_visit_status[task.task_type] = true;
            }
        }

        writeDB(db);
        res.json({ success: true, task });
    },

    // Submit intake form
    submitIntakeForm: (req, res) => {
        const { patientId } = req.params;
        const { formData } = req.body;
        const db = readDB();
        
        const formId = getNextId('intake_forms');
        db.intake_forms.push({
            id: formId,
            patient_id: parseInt(patientId),
            form_data: JSON.stringify(formData),
            submitted_at: new Date().toISOString(),
            reviewed_by: null,
            reviewed_at: null
        });

        // Update patient status
        const patient = db.contacts.find(c => c.id === parseInt(patientId));
        if (patient && patient.pre_visit_status) {
            patient.pre_visit_status.intake_forms_completed = true;
        }

        writeDB(db);
        res.json({ success: true, form_id: formId });
    }
};

module.exports = { preVisitRoutes, triggerPreVisitAutomation };
