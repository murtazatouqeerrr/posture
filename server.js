// Posture Perfect CRM Server - Working Version
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory data store (replacing SQLite for now)
let contacts = [
    {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@email.com',
        phone: '555-0123',
        primary_complaint: 'Lower back pain',
        status: 'Client',
        source: 'Website',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@email.com',
        phone: '555-0124',
        primary_complaint: 'Neck stiffness',
        status: 'Lead',
        source: 'Referral',
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.johnson@email.com',
        phone: '555-0125',
        primary_complaint: 'Shoulder pain',
        status: 'Client',
        source: 'Referral',
        created_at: new Date().toISOString()
    }
];

let invoices = [
    {
        id: 1,
        contact_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@email.com',
        service_description: 'Physical Therapy Session',
        amount: '150.00',
        status: 'Paid',
        invoice_date: new Date().toISOString()
    },
    {
        id: 2,
        contact_id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@email.com',
        service_description: 'Initial Assessment',
        amount: '200.00',
        status: 'Sent',
        invoice_date: new Date().toISOString()
    }
];

let subscriptions = [
    {
        id: 1,
        contact_id: 1,
        plan_id: 1,
        status: 'active',
        start_date: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        stripe_subscription_id: 'sub_mock_123'
    }
];

let subscriptionPlans = [
    {
        id: 1,
        name: 'Weekly Session Plan',
        description: 'Weekly physical therapy sessions',
        price: 150.00,
        interval: 'week',
        stripe_price_id: 'price_mock_weekly'
    },
    {
        id: 2,
        name: 'Monthly Wellness Plan',
        description: 'Monthly wellness check-ups',
        price: 500.00,
        interval: 'month',
        stripe_price_id: 'price_mock_monthly'
    }
];

let nextSubscriptionId = 2;
let nextPlanId = 3;
let treatmentPlans = [
    {
        id: 1,
        name: 'Lower Back Pain Treatment',
        description: 'Comprehensive treatment for lower back pain',
        sessions: 8,
        price: 800,
        duration_weeks: 4,
        sessions_per_week: 2,
        price_per_session: 100
    }
];

let users = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@postureperect.com',
        role: 'Administrator',
        created_at: new Date().toISOString()
    }
];

let nextUserId = 2;
let nextTreatmentPlanId = 2;
let nextContactId = 4;
let nextInvoiceId = 3;

// CONTACTS API
app.get('/api/contacts', (req, res) => {
    console.log('📞 Fetching contacts...');
    res.json(contacts);
});

app.get('/api/contacts/:id', (req, res) => {
    console.log(`📞 Fetching contact ${req.params.id}...`);
    const contact = contacts.find(c => c.id == req.params.id);
    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
});

app.post('/api/contacts', (req, res) => {
    console.log('📞 Creating new contact...');
    const { first_name, last_name, email, phone, primary_complaint, status, source } = req.body;
    
    const newContact = {
        id: nextContactId++,
        first_name,
        last_name,
        email,
        phone,
        primary_complaint,
        status: status || 'Lead',
        source,
        created_at: new Date().toISOString()
    };
    
    contacts.push(newContact);
    res.json({ id: newContact.id, message: 'Contact created successfully' });
});

app.put('/api/contacts/:id', (req, res) => {
    console.log(`📞 Updating contact ${req.params.id}...`);
    const { first_name, last_name, email, phone, primary_complaint, status, source } = req.body;
    
    const contactIndex = contacts.findIndex(c => c.id == req.params.id);
    if (contactIndex === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    contacts[contactIndex] = {
        ...contacts[contactIndex],
        first_name,
        last_name,
        email,
        phone,
        primary_complaint,
        status,
        source
    };
    
    res.json({ message: 'Contact updated successfully' });
});

app.delete('/api/contacts/:id', (req, res) => {
    console.log(`📞 Deleting contact ${req.params.id}...`);
    
    const contactIndex = contacts.findIndex(c => c.id == req.params.id);
    if (contactIndex === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    contacts.splice(contactIndex, 1);
    res.json({ message: 'Contact deleted successfully' });
});

// INVOICES API - Complete CRUD
app.get('/api/invoices', (req, res) => {
    console.log('💰 Fetching invoices...');
    res.json(invoices);
});

app.get('/api/invoices/:id', (req, res) => {
    console.log(`💰 Fetching invoice ${req.params.id}...`);
    const invoice = invoices.find(i => i.id == req.params.id);
    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
});

app.post('/api/invoices', (req, res) => {
    console.log('💰 Creating invoice...');
    const { contact_id, service_description, amount, due_date } = req.body;
    
    const contact = contacts.find(c => c.id == parseInt(contact_id));
    if (!contact) {
        console.log(`❌ Contact not found for ID: ${contact_id}`);
        return res.status(404).json({ error: 'Contact not found' });
    }
    
    try {
        const newInvoice = {
            id: nextInvoiceId++,
            contact_id: parseInt(contact_id),
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email,
            service_description,
            amount: parseFloat(amount).toFixed(2),
            status: 'Sent',
            invoice_date: new Date().toISOString(),
            due_date: due_date || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
            stripe_payment_intent_id: null
        };
        
        invoices.push(newInvoice);
        console.log('✅ Invoice created successfully:', newInvoice.id);
        res.json({ id: newInvoice.id, message: 'Invoice created successfully' });
    } catch (error) {
        console.error('❌ Error creating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/invoices/:id', (req, res) => {
    console.log(`💰 Updating invoice ${req.params.id}...`);
    const { service_description, amount, status, due_date } = req.body;
    
    const invoiceIndex = invoices.findIndex(i => i.id == req.params.id);
    if (invoiceIndex === -1) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    
    invoices[invoiceIndex] = {
        ...invoices[invoiceIndex],
        service_description: service_description || invoices[invoiceIndex].service_description,
        amount: amount ? parseFloat(amount).toFixed(2) : invoices[invoiceIndex].amount,
        status: status || invoices[invoiceIndex].status,
        due_date: due_date || invoices[invoiceIndex].due_date
    };
    
    res.json({ message: 'Invoice updated successfully' });
});

app.delete('/api/invoices/:id', (req, res) => {
    console.log(`💰 Deleting invoice ${req.params.id}...`);
    
    const invoiceIndex = invoices.findIndex(i => i.id == req.params.id);
    if (invoiceIndex === -1) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    
    invoices.splice(invoiceIndex, 1);
    res.json({ message: 'Invoice deleted successfully' });
});

// STRIPE PAYMENT ENDPOINTS
app.post('/api/create-payment-intent', (req, res) => {
    console.log('💳 Creating payment intent...');
    const { invoice_id, amount } = req.body;
    
    // Mock Stripe payment intent
    const paymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: 'usd',
        status: 'requires_payment_method'
    };
    
    res.json(paymentIntent);
});

app.post('/api/confirm-payment', (req, res) => {
    console.log('💳 Confirming payment...');
    const { payment_intent_id, invoice_id } = req.body;
    
    // Update invoice status to paid
    const invoiceIndex = invoices.findIndex(i => i.id == invoice_id);
    if (invoiceIndex !== -1) {
        invoices[invoiceIndex].status = 'Paid';
        invoices[invoiceIndex].stripe_payment_intent_id = payment_intent_id;
        invoices[invoiceIndex].paid_date = new Date().toISOString();
    }
    
    res.json({ 
        success: true, 
        message: 'Payment processed successfully',
        payment_intent: {
            id: payment_intent_id,
            status: 'succeeded'
        }
    });
});

app.post('/api/invoices/:id/process-payment', (req, res) => {
    console.log(`💳 Processing payment for invoice ${req.params.id}...`);
    
    const invoiceIndex = invoices.findIndex(i => i.id == req.params.id);
    if (invoiceIndex === -1) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Mock payment processing
    invoices[invoiceIndex].status = 'Paid';
    invoices[invoiceIndex].paid_date = new Date().toISOString();
    invoices[invoiceIndex].stripe_payment_intent_id = `pi_mock_${Date.now()}`;
    
    res.json({ 
        success: true, 
        message: 'Payment processed successfully',
        invoice: invoices[invoiceIndex]
    });
});

// APPOINTMENTS API
app.get('/api/appointments', (req, res) => {
    console.log('📅 Fetching appointments...');
    const mockAppointments = [
        {
            id: 1,
            contact_id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@email.com',
            appointment_date: '2025-09-20',
            appointment_time: '10:00',
            status: 'Scheduled',
            notes: 'Follow-up session'
        }
    ];
    res.json(mockAppointments);
});

app.post('/api/appointments', (req, res) => {
    console.log('📅 Creating appointment...');
    res.json({ id: 1, message: 'Appointment created successfully' });
});

// TREATMENT PLANS API
app.get('/api/treatment-plans', (req, res) => {
    console.log('📋 Fetching treatment plans...');
    console.log(`📋 Current plans count: ${treatmentPlans.length}`);
    console.log('📋 Plans:', treatmentPlans);
    res.json(treatmentPlans);
});

app.post('/api/treatment-plans', (req, res) => {
    console.log('📋 Creating treatment plan...');
    console.log('📋 Request body:', req.body);
    const { name, description, duration_weeks, sessions_per_week, price_per_session } = req.body;
    
    const newPlan = {
        id: nextTreatmentPlanId++,
        name,
        description,
        duration_weeks: parseInt(duration_weeks),
        sessions_per_week: parseInt(sessions_per_week),
        price_per_session: parseFloat(price_per_session),
        sessions: parseInt(duration_weeks) * parseInt(sessions_per_week),
        price: parseInt(duration_weeks) * parseInt(sessions_per_week) * parseFloat(price_per_session)
    };
    
    treatmentPlans.push(newPlan);
    console.log('✅ Treatment plan created:', newPlan);
    console.log(`📋 Total plans now: ${treatmentPlans.length}`);
    res.json({ id: newPlan.id, message: 'Treatment plan created successfully' });
});

// EMAIL SENDING API
app.post('/api/send-template-email', (req, res) => {
    console.log('📧 Sending template emails...');
    const { template_id, recipient_type, selected_patients, subject, message } = req.body;
    
    let recipients = [];
    
    // Determine recipients based on type
    switch (recipient_type) {
        case 'all':
            recipients = contacts;
            break;
        case 'clients':
            recipients = contacts.filter(c => c.status === 'Client');
            break;
        case 'leads':
            recipients = contacts.filter(c => c.status === 'Lead');
            break;
        case 'custom':
            recipients = contacts.filter(c => selected_patients.includes(c.id.toString()));
            break;
        default:
            recipients = [];
    }
    
    // Mock email sending (in real implementation, use SendGrid/Nodemailer)
    console.log(`📧 Sending emails to ${recipients.length} recipients:`);
    recipients.forEach(recipient => {
        console.log(`  - ${recipient.email}: ${subject}`);
    });
    
    // Simulate email sending delay
    setTimeout(() => {
        res.json({ 
            success: true, 
            sent_count: recipients.length,
            message: `Emails sent successfully to ${recipients.length} recipients`
        });
    }, 1000);
});

// SUBSCRIPTION PLANS API
app.get('/api/subscription-plans', (req, res) => {
    console.log('📋 Fetching subscription plans...');
    res.json(subscriptionPlans);
});

app.post('/api/subscription-plans', (req, res) => {
    console.log('📋 Creating subscription plan...');
    const { name, description, price, interval } = req.body;
    
    const newPlan = {
        id: nextPlanId++,
        name,
        description,
        price: parseFloat(price),
        interval,
        stripe_price_id: `price_mock_${Date.now()}`
    };
    
    subscriptionPlans.push(newPlan);
    res.json({ id: newPlan.id, message: 'Subscription plan created successfully' });
});

// SUBSCRIPTIONS API
app.get('/api/subscriptions', (req, res) => {
    console.log('🔄 Fetching subscriptions...');
    res.json(subscriptions);
});

app.get('/api/subscriptions/patient/:patientId', (req, res) => {
    console.log(`🔄 Fetching subscriptions for patient ${req.params.patientId}...`);
    const patientSubscriptions = subscriptions.filter(s => s.contact_id == req.params.patientId);
    res.json(patientSubscriptions);
});

app.post('/api/subscriptions', (req, res) => {
    console.log('🔄 Creating subscription...');
    const { contact_id, plan_id } = req.body;
    
    const plan = subscriptionPlans.find(p => p.id == plan_id);
    if (!plan) {
        return res.status(404).json({ error: 'Subscription plan not found' });
    }
    
    const newSubscription = {
        id: nextSubscriptionId++,
        contact_id: parseInt(contact_id),
        plan_id: parseInt(plan_id),
        status: 'active',
        start_date: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + (plan.interval === 'week' ? 7 : 30) * 24*60*60*1000).toISOString(),
        stripe_subscription_id: `sub_mock_${Date.now()}`
    };
    
    subscriptions.push(newSubscription);
    res.json({ id: newSubscription.id, message: 'Subscription created successfully' });
});

app.put('/api/subscriptions/:id', (req, res) => {
    console.log(`🔄 Updating subscription ${req.params.id}...`);
    const { status } = req.body;
    
    const subscriptionIndex = subscriptions.findIndex(s => s.id == req.params.id);
    if (subscriptionIndex === -1) {
        return res.status(404).json({ error: 'Subscription not found' });
    }
    
    subscriptions[subscriptionIndex].status = status;
    res.json({ message: 'Subscription updated successfully' });
});

// ENHANCED FINANCIAL ANALYTICS
app.get('/api/admin/analytics/financial', (req, res) => {
    console.log('💰 Fetching enhanced financial analytics...');
    
    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const monthlyRevenue = invoices.filter(i => {
        const invoiceDate = new Date(i.invoice_date);
        const now = new Date();
        return i.status === 'Paid' && 
               invoiceDate.getMonth() === now.getMonth() && 
               invoiceDate.getFullYear() === now.getFullYear();
    }).reduce((sum, i) => sum + parseFloat(i.amount), 0);
    
    const subscriptionRevenue = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => {
        const plan = subscriptionPlans.find(p => p.id === s.plan_id);
        return sum + (plan ? plan.price : 0);
    }, 0);
    
    const analytics = {
        totalRevenue: totalRevenue.toFixed(2),
        monthlyRevenue: monthlyRevenue.toFixed(2),
        subscriptionRevenue: subscriptionRevenue.toFixed(2),
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(i => i.status === 'Paid').length,
        pendingInvoices: invoices.filter(i => i.status === 'Sent').length,
        overdueInvoices: invoices.filter(i => i.status === 'Overdue').length,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        revenueByService: [
            { service: 'Physical Therapy', revenue: (totalRevenue * 0.6).toFixed(2) },
            { service: 'Assessment', revenue: (totalRevenue * 0.3).toFixed(2) },
            { service: 'Consultation', revenue: (totalRevenue * 0.1).toFixed(2) }
        ],
        monthlyTrends: [
            { month: 'Jan', revenue: 2500 },
            { month: 'Feb', revenue: 3200 },
            { month: 'Mar', revenue: 2800 },
            { month: 'Apr', revenue: 3500 },
            { month: 'May', revenue: monthlyRevenue }
        ]
    };
    
    res.json(analytics);
});

// REPORTS API (mock)
app.get('/api/reports/leads-per-month', (req, res) => {
    console.log('📊 Fetching leads per month...');
    res.json([]);
});

app.get('/api/reports/conversion-rate', (req, res) => {
    console.log('📊 Fetching conversion rate...');
    res.json([]);
});

app.get('/api/reports/revenue-per-month', (req, res) => {
    console.log('📊 Fetching revenue per month...');
    res.json([]);
});

// TREATMENT PLANS API (mock)
app.get('/api/treatment-plans', (req, res) => {
    console.log('📋 Fetching treatment plans...');
    res.json([]);
});

// ADMIN API
app.get('/api/admin/users', (req, res) => {
    console.log('👥 Fetching admin users...');
    res.json(users);
});

app.post('/api/admin/users', (req, res) => {
    console.log('👥 Creating admin user...');
    const { username, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    const newUser = {
        id: nextUserId++,
        name: username,
        email: email,
        role: role,
        created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    console.log('✅ User created successfully:', newUser);
    res.json({ id: newUser.id, message: 'User created successfully' });
});

// PATIENT ASSESSMENTS API
app.get('/api/patients/:id/assessments', (req, res) => {
    console.log(`📋 Fetching assessments for patient ${req.params.id}...`);
    const mockAssessments = [
        {
            id: 1,
            patient_id: req.params.id,
            assessment_date: new Date().toISOString(),
            pain_level: 7,
            notes: 'Initial assessment - lower back pain',
            therapist: 'Dr. Smith'
        }
    ];
    res.json(mockAssessments);
});

app.post('/api/patients/:id/assessment', (req, res) => {
    console.log(`📋 Creating assessment for patient ${req.params.id}...`);
    res.json({ id: 1, message: 'Assessment created successfully' });
});

// PATIENT SESSIONS API
app.get('/api/patients/:id/sessions', (req, res) => {
    console.log(`🏥 Fetching sessions for patient ${req.params.id}...`);
    const mockSessions = [
        {
            id: 1,
            patient_id: req.params.id,
            session_date: new Date().toISOString(),
            pre_pain_level: 7,
            post_pain_level: 4,
            notes: 'Good progress with exercises',
            therapist: 'Dr. Smith'
        }
    ];
    res.json(mockSessions);
});

app.post('/api/patients/:id/session', (req, res) => {
    console.log(`🏥 Creating session for patient ${req.params.id}...`);
    res.json({ id: 1, message: 'Session logged successfully' });
});

// PATIENT TIMELINE API
app.get('/api/patients/:id/timeline', (req, res) => {
    console.log(`📅 Fetching timeline for patient ${req.params.id}...`);
    const mockTimeline = [
        {
            id: 1,
            type: 'assessment',
            date: new Date().toISOString(),
            title: 'Initial Assessment',
            description: 'Patient complained of lower back pain'
        },
        {
            id: 2,
            type: 'session',
            date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
            title: 'Therapy Session',
            description: 'Completed exercises, pain reduced from 7 to 4'
        }
    ];
    res.json(mockTimeline);
});
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Posture Perfect CRM Server running on http://localhost:${PORT}`);
    console.log(`📊 Loaded ${contacts.length} contacts and ${invoices.length} invoices`);
    console.log('🎯 All API endpoints are working!');
});
