console.log('🔄 Starting Posture Perfect CRM Server...');

const express = require('express');
const path = require('path');

console.log('📦 Express loaded');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Express app created, PORT:', PORT);

// Middleware
console.log('🔄 Setting up middleware...');
app.use(express.json());
app.use(express.static('public'));
console.log('✅ Middleware configured');

// Mock data since SQLite is not working in this environment
console.log('📝 Using mock data for all endpoints');

// Mock subscription plans data
const mockSubscriptionPlans = [
    { id: 1, name: 'Weekly Session Plan', description: 'Weekly physical therapy sessions with personalized treatment', price: 120.00, billing_interval: 'weekly', features: 'Weekly sessions, Progress tracking, Exercise plans' },
    { id: 2, name: 'Bi-Weekly Plan', description: 'Bi-weekly sessions for ongoing maintenance', price: 220.00, billing_interval: 'bi-weekly', features: 'Bi-weekly sessions, Progress tracking, Home exercises' },
    { id: 3, name: 'Monthly Maintenance', description: 'Monthly check-ups and maintenance sessions', price: 100.00, billing_interval: 'monthly', features: 'Monthly sessions, Assessment updates, Exercise modifications' },
    { id: 4, name: 'Intensive Program', description: 'Intensive 4-week rehabilitation program', price: 400.00, billing_interval: 'monthly', features: 'Daily sessions, Comprehensive assessment, Recovery plan' }
];

// Mock templates data
const mockTemplates = [
    { id: 1, name: 'Welcome Email', type: 'EMAIL', subject: 'Welcome to Posture Perfect!', content: 'Dear {{patient_name}}, welcome to our clinic! Your first appointment is scheduled for {{appointment_date}}.', variables: '["patient_name", "appointment_date"]' },
    { id: 2, name: 'Appointment Reminder', type: 'EMAIL', subject: 'Appointment Reminder', content: 'Hi {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}}.', variables: '["patient_name", "appointment_date", "appointment_time"]' },
    { id: 3, name: 'Treatment Plan', type: 'DOCUMENT', subject: 'Treatment Plan for {{patient_name}}', content: 'Treatment plan for {{patient_name}} - Diagnosis: {{diagnosis}}, Sessions: {{session_count}}, Duration: {{duration}} weeks', variables: '["patient_name", "diagnosis", "session_count", "duration"]' },
    { id: 4, name: 'Invoice Template', type: 'DOCUMENT', subject: 'Invoice {{invoice_number}}', content: 'Invoice for {{patient_name}} - Amount: ${{amount}}, Due: {{due_date}}, Services: {{services}}', variables: '["patient_name", "invoice_number", "amount", "due_date", "services"]' },
    { id: 5, name: 'SMS Reminder', type: 'SMS', subject: '', content: 'Hi {{patient_name}}, appointment reminder for {{time}}', variables: '["patient_name", "time"]' },
    { id: 6, name: 'Follow-up Email', type: 'EMAIL', subject: 'How are you feeling?', content: 'Hi {{patient_name}}, how are you feeling after your last session on {{last_session_date}}?', variables: '["patient_name", "last_session_date"]' },
    { id: 7, name: 'Payment Reminder', type: 'EMAIL', subject: 'Payment Due', content: 'Dear {{patient_name}}, your payment of ${{amount}} is due on {{due_date}}.', variables: '["patient_name", "amount", "due_date"]' },
    { id: 8, name: 'Exercise Plan', type: 'DOCUMENT', subject: 'Home Exercise Plan', content: 'Exercise plan for {{patient_name}} - {{exercise_count}} exercises for {{condition}}', variables: '["patient_name", "exercise_count", "condition"]' },
    { id: 9, name: 'Discharge Summary', type: 'DOCUMENT', subject: 'Discharge Summary', content: 'Discharge summary for {{patient_name}} - Treatment completed on {{completion_date}}', variables: '["patient_name", "completion_date"]' },
    { id: 10, name: 'Referral Letter', type: 'DOCUMENT', subject: 'Referral for {{patient_name}}', content: 'Referral letter for {{patient_name}} to {{specialist}} for {{condition}}', variables: '["patient_name", "specialist", "condition"]' }
];

// Mock invoices data
const mockInvoices = [
    { id: 1, contact_id: 1, amount: 150.00, description: 'Initial Consultation and Assessment', status: 'Paid', due_date: '2024-01-15', first_name: 'Emily', last_name: 'Johnson', email: 'emily.johnson@email.com', created_at: '2024-01-01' },
    { id: 2, contact_id: 2, amount: 200.00, description: 'Monthly Treatment Package', status: 'Sent', due_date: '2024-02-15', first_name: 'John', last_name: 'Smith', email: 'john.smith@email.com', created_at: '2024-01-15' },
    { id: 3, contact_id: 3, amount: 75.00, description: 'Follow-up Session', status: 'Overdue', due_date: '2024-01-30', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@email.com', created_at: '2024-01-20' },
    { id: 4, contact_id: 4, amount: 300.00, description: 'Comprehensive Treatment Plan', status: 'Paid', due_date: '2024-02-01', first_name: 'Mike', last_name: 'Brown', email: 'mike.brown@email.com', created_at: '2024-01-25' },
    { id: 5, contact_id: 1, amount: 125.00, description: 'Posture Correction Session', status: 'Sent', due_date: '2024-02-20', first_name: 'Emily', last_name: 'Johnson', email: 'emily.johnson@email.com', created_at: '2024-02-01' }
];

// Mock campaigns data
const mockCampaigns = [
    { id: 1, name: 'New Patient Welcome', subject: 'Welcome to Posture Perfect!', content: 'Welcome to our clinic...', target_audience: 'new_patients', channel: 'email', status: 'Active', created_at: '2024-01-01' },
    { id: 2, name: 'Monthly Health Tips', subject: 'Your Monthly Health Tips', content: 'Here are some tips...', target_audience: 'all_patients', channel: 'email', status: 'Active', created_at: '2024-01-15' },
    { id: 3, name: 'Posture Assessment Reminder', subject: '', content: 'Time for your posture assessment...', target_audience: 'existing_patients', channel: 'sms', status: 'Active', created_at: '2024-02-01' },
    { id: 4, name: 'Holiday Special Offer', subject: 'Special Holiday Discount!', content: 'Get 20% off...', target_audience: 'all_patients', channel: 'email', status: 'Completed', created_at: '2023-12-01' },
    { id: 5, name: 'Summer Wellness Program', subject: 'Join Our Summer Program', content: 'Summer wellness program...', target_audience: 'active_patients', channel: 'email', status: 'Draft', created_at: '2024-02-15' }
];

// Mock subscriptions data
const mockSubscriptions = [
    { id: 1, contact_id: 1, plan_id: 1, status: 'active', start_date: '2024-01-01', end_date: '2024-12-31' },
    { id: 2, contact_id: 2, plan_id: 2, status: 'active', start_date: '2024-02-01', end_date: '2024-12-31' },
    { id: 3, contact_id: 3, plan_id: 3, status: 'active', start_date: '2024-03-01', end_date: '2024-12-31' },
    { id: 4, contact_id: 4, plan_id: 4, status: 'cancelled', start_date: '2024-01-15', end_date: '2024-06-15' }
];

// API ENDPOINTS

// Subscription Plans API
app.get('/api/subscription-plans', (req, res) => {
    console.log('📊 GET /api/subscription-plans called');
    res.json(mockSubscriptionPlans);
});

// Templates API
app.get('/api/templates', (req, res) => {
    console.log('📄 GET /api/templates called');
    res.json(mockTemplates);
});

// Invoices API
app.get('/api/invoices', (req, res) => {
    console.log('💰 GET /api/invoices called');
    res.json(mockInvoices);
});

// Campaigns API
app.get('/api/campaigns', (req, res) => {
    console.log('📢 GET /api/campaigns called');
    res.json(mockCampaigns);
});

// Subscriptions API
app.get('/api/subscriptions', (req, res) => {
    console.log('🔄 GET /api/subscriptions called');
    res.json(mockSubscriptions);
});

// Financial Analytics API
app.get('/api/admin/analytics/financial', (req, res) => {
    console.log('📊 GET /api/admin/analytics/financial called');
    
    // Calculate analytics from mock data
    const totalRevenue = mockInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const pendingInvoices = mockInvoices.filter(i => i.status !== 'Paid').length;
    const activePatients = 3; // Mock value
    const monthlyRecurringRevenue = totalRevenue / 12;
    
    res.json({
        total_revenue: totalRevenue,
        monthly_recurring_revenue: monthlyRecurringRevenue,
        active_patients: activePatients,
        pending_invoices: pendingInvoices
    });
});

// Reports API endpoints
app.get('/api/reports/leads-per-month', (req, res) => {
    console.log('📊 GET /api/reports/leads-per-month called');
    res.json([
        { month: 'Jan', leads: 15 },
        { month: 'Feb', leads: 22 },
        { month: 'Mar', leads: 18 },
        { month: 'Apr', leads: 25 },
        { month: 'May', leads: 30 },
        { month: 'Jun', leads: 28 }
    ]);
});

app.get('/api/reports/conversion-rate', (req, res) => {
    console.log('📊 GET /api/reports/conversion-rate called');
    res.json({ rate: 0.65 });
});

app.get('/api/reports/revenue-per-month', (req, res) => {
    console.log('📊 GET /api/reports/revenue-per-month called');
    res.json([
        { month: 'Jan', revenue: 1200 },
        { month: 'Feb', revenue: 1900 },
        { month: 'Mar', revenue: 3000 },
        { month: 'Apr', revenue: 5000 },
        { month: 'May', revenue: 2000 },
        { month: 'Jun', revenue: 3000 }
    ]);
});

// Contacts API (basic)
app.get('/api/contacts', (req, res) => {
    console.log('👥 GET /api/contacts called');
    res.json([
        { id: 1, first_name: 'Emily', last_name: 'Johnson', email: 'emily.johnson@email.com', status: 'Client' },
        { id: 2, first_name: 'John', last_name: 'Smith', email: 'john.smith@email.com', status: 'Client' },
        { id: 3, first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@email.com', status: 'Lead' },
        { id: 4, first_name: 'Mike', last_name: 'Brown', email: 'mike.brown@email.com', status: 'Client' }
    ]);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Posture Perfect CRM Server running on http://localhost:${PORT}`);
    console.log('✅ All API endpoints configured with mock data');
    console.log('✅ Server ready for testing');
});

// Export for Vercel
module.exports = app;
