// Enhanced Posture Perfect CRM Server with Pre-Visit Automation
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON Database helper functions
function readDB() {
    const dbPath = path.join(__dirname, 'enhanced_db.json');
    if (!fs.existsSync(dbPath)) {
        // Create default database if it doesn't exist
        const defaultDB = {
            contacts: [],
            onboarding_tasks: [],
            automated_emails: [],
            intake_forms: [],
            packages: [],
            patient_packages: [],
            users: [],
            patient_logins: [],
            appointments: [],
            patient_assessments: [],
            patient_sessions: [],
            tasks: [],
            invoices: []
        };
        fs.writeFileSync(dbPath, JSON.stringify(defaultDB, null, 2));
    }
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

// Middleware
app.use(express.json());
app.use(express.static('public'));

// EXISTING CONTACTS API (Enhanced)
app.get('/api/contacts', (req, res) => {
    const db = readDB();
    res.json(db.contacts);
});

app.get('/api/contacts/:id', (req, res) => {
    const db = readDB();
    const contact = db.contacts.find(c => c.id === parseInt(req.params.id));
    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
});

app.post('/api/contacts', (req, res) => {
    const { first_name, last_name, email, phone, primary_complaint, status, referred_by } = req.body;
    const db = readDB();
    
    const newContact = {
        id: getNextId('contacts'),
        first_name,
        last_name,
        email,
        phone,
        primary_complaint,
        status: status || 'Lead',
        referred_by,
        pre_visit_status: {
            intake_forms_sent: false,
            intake_forms_completed: false,
            cc_on_file: false,
            first_appointment_scheduled: false
        },
        created_at: new Date().toISOString()
    };
    
    db.contacts.push(newContact);
    writeDB(db);
    
    // Trigger pre-visit automation if status is 'Client'
    if (status === 'Client') {
        triggerPreVisitAutomation(newContact.id);
    }
    
    res.json({ id: newContact.id, message: 'Contact created successfully' });
});

app.put('/api/contacts/:id', (req, res) => {
    const db = readDB();
    const contactIndex = db.contacts.findIndex(c => c.id === parseInt(req.params.id));
    
    if (contactIndex === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    const oldStatus = db.contacts[contactIndex].status;
    db.contacts[contactIndex] = { ...db.contacts[contactIndex], ...req.body };
    
    // Trigger pre-visit automation if status changed to 'Client'
    if (oldStatus !== 'Client' && req.body.status === 'Client') {
        triggerPreVisitAutomation(parseInt(req.params.id));
    }
    
    writeDB(db);
    res.json({ message: 'Contact updated successfully' });
});

app.delete('/api/contacts/:id', (req, res) => {
    const db = readDB();
    db.contacts = db.contacts.filter(c => c.id !== parseInt(req.params.id));
    writeDB(db);
    res.json({ message: 'Contact deleted successfully' });
});

// PRE-VISIT AUTOMATION API ENDPOINTS

// Trigger pre-visit automation
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

app.post('/api/patients/:id/trigger-automation', (req, res) => {
    const result = triggerPreVisitAutomation(parseInt(req.params.id));
    
    if (result.error) {
        return res.status(404).json(result);
    }
    res.json(result);
});

// Get pre-visit checklist for a patient
app.get('/api/patients/:id/pre-visit-checklist', (req, res) => {
    const db = readDB();
    const patient = db.contacts.find(c => c.id === parseInt(req.params.id));
    
    if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
    }

    const tasks = db.onboarding_tasks.filter(t => t.patient_id === parseInt(req.params.id));
    const emails = db.automated_emails.filter(e => e.patient_id === parseInt(req.params.id));
    
    res.json({
        patient_id: req.params.id,
        patient: patient,
        pre_visit_status: patient.pre_visit_status || {},
        tasks: tasks,
        emails: emails
    });
});

// Update task status
app.put('/api/tasks/:id/status', (req, res) => {
    const { status, notes } = req.body;
    const db = readDB();
    
    const task = db.onboarding_tasks.find(t => t.id === parseInt(req.params.id));
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
});

// Submit intake form
app.post('/api/patients/:id/intake-form', (req, res) => {
    const { formData } = req.body;
    const db = readDB();
    
    const formId = getNextId('intake_forms');
    db.intake_forms.push({
        id: formId,
        patient_id: parseInt(req.params.id),
        form_data: JSON.stringify(formData),
        submitted_at: new Date().toISOString(),
        reviewed_by: null,
        reviewed_at: null
    });

    // Update patient status
    const patient = db.contacts.find(c => c.id === parseInt(req.params.id));
    if (patient && patient.pre_visit_status) {
        patient.pre_visit_status.intake_forms_completed = true;
    }

    writeDB(db);
    res.json({ success: true, form_id: formId });
});

// PACKAGE SYSTEM API (Module 2 Preview)
app.get('/api/packages', (req, res) => {
    const db = readDB();
    res.json(db.packages);
});

app.post('/api/patients/:id/purchase-package', (req, res) => {
    const { packageId } = req.body;
    const db = readDB();
    
    const package = db.packages.find(p => p.id === parseInt(packageId));
    if (!package) {
        return res.status(404).json({ error: 'Package not found' });
    }
    
    const purchaseId = getNextId('patient_packages');
    db.patient_packages.push({
        id: purchaseId,
        patient_id: parseInt(req.params.id),
        package_id: parseInt(packageId),
        purchase_date: new Date().toISOString(),
        sessions_remaining: package.number_of_sessions,
        is_active: true
    });
    
    writeDB(db);
    res.json({ success: true, purchase_id: purchaseId });
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve pre-visit checklist
app.get('/pre-visit-checklist', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pre-visit-checklist.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Enhanced Posture Perfect CRM Server running on http://localhost:${PORT}`);
    console.log('✅ Module 1: Pre-Visit Task Automation - IMPLEMENTED');
    console.log('🔄 Module 2: Package System - PREVIEW READY');
    console.log('📋 Access Pre-Visit Checklist: http://localhost:${PORT}/pre-visit-checklist?patientId=100');
});
