# Phase 2: Financial Powerhouse - Setup Instructions

## Overview
This implementation includes Phase 2 features from the requirements:
- ✅ Stripe API integration for payments
- ✅ Persistent SQLite database (fixes data fetching issues)
- ✅ Enhanced invoicing with payment processing
- ✅ Subscription management system
- ✅ Patient billing portal
- ✅ Financial analytics and reporting
- ✅ HIPAA compliance audit logging

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Edit the `.env` file with your Stripe keys:
```env
PORT=3000
NODE_ENV=development
DB_PATH=./crm.db

# Replace with your actual Stripe keys
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

### 3. Start the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Stripe Setup Instructions

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Navigate to the Dashboard
3. Go to Developers > API keys

### 2. Get API Keys
- Copy your **Publishable key** (starts with `pk_test_`)
- Copy your **Secret key** (starts with `sk_test_`)
- Update the `.env` file with these keys

### 3. Update Frontend Stripe Key
Edit `public/payment.js` line 15:
```javascript
this.stripe = Stripe('pk_test_your_actual_publishable_key_here');
```

## Database Features

### Persistent Database
- Uses SQLite file database (`crm.db`) instead of in-memory
- Data persists between server restarts
- Automatic schema initialization on startup

### New Tables Added
- `subscription_plans` - Recurring billing plans
- `subscriptions` - Customer subscriptions
- `payment_methods` - Saved payment methods
- `patient_assessments` - Initial patient assessments
- `patient_sessions` - Treatment session logs
- `audit_log` - HIPAA compliance logging

## New Features

### 1. Payment Processing
- **Create Payment Intent**: `/api/stripe/create-payment-intent`
- **Confirm Payment**: `/api/stripe/confirm-payment`
- **Save Payment Method**: `/api/stripe/save-payment-method`

### 2. Customer Management
- **Create Stripe Customer**: `/api/stripe/create-customer`
- Automatic customer creation for new patients

### 3. Subscription Management
- **Get Plans**: `/api/subscription-plans`
- **Create Subscription**: `/api/subscriptions`
- Recurring billing with Stripe subscriptions

### 4. Enhanced Patient Profiles
- **Billing Tab**: Payment methods, invoice history, subscriptions
- **Assessment Tracking**: Initial assessments with pain levels
- **Session Logging**: Treatment sessions with pre/post pain tracking
- **Timeline View**: Complete patient interaction history

### 5. Financial Analytics
- **Enhanced Dashboard**: `/api/admin/analytics/financial`
- **Revenue by Service**: `/api/reports/revenue-by-service`
- Real-time financial metrics

## Usage Guide

### 1. Login
- Username: `admin`
- Password: `admin123`

### 2. Setting Up Payments for a Patient
1. Go to Dashboard and click on a patient
2. Click "Setup Payments" button
3. This creates a Stripe customer for the patient

### 3. Processing Payments
1. Go to Invoices section
2. Click "Process Payment" on any invoice
3. Enter test card: `4242 4242 4242 4242`
4. Use any future expiry date and any CVC

### 4. Creating Subscriptions
1. Go to patient profile > Billing tab
2. Click "Manage Subscription"
3. Select a plan and payment method
4. Subscription will be created in Stripe

## Test Card Numbers (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

## File Structure
```
/
├── server.js                 # Enhanced server with Stripe integration
├── database-schema.sql       # Complete database schema
├── .env                      # Environment configuration
├── package.json              # Updated dependencies
├── public/
│   ├── index.html            # Enhanced with Stripe integration
│   ├── payment.js            # New payment processing module
│   ├── app.js                # Main application logic
│   ├── dashboard.js          # Dashboard functionality
│   ├── calendar.js           # Calendar management
│   ├── invoices.js           # Invoice management
│   ├── reports.js            # Reporting functionality
│   ├── templates.js          # Treatment templates
│   ├── admin-dashboard.js    # Admin functionality
│   └── patient-profile.js    # Patient profile management
└── crm.db                    # SQLite database file (created on first run)
```

## Security Features
- **Audit Logging**: All database changes are logged
- **Session Management**: Secure session handling
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **HIPAA Compliance**: Comprehensive audit trails

## Troubleshooting

### Database Issues
If you encounter database issues:
```bash
# Delete the database file to reset
rm crm.db
# Restart the server to recreate
npm run dev
```

### Stripe Issues
- Ensure you're using test keys (start with `pk_test_` and `sk_test_`)
- Check browser console for JavaScript errors
- Verify API keys are correctly set in both `.env` and `payment.js`

### Port Issues
If port 3000 is in use:
```bash
# Change port in .env file
PORT=3001
```

## Production Deployment

### 1. Environment Setup
- Use production Stripe keys
- Set `NODE_ENV=production`
- Use a strong session secret
- Consider using PostgreSQL instead of SQLite

### 2. Security Considerations
- Enable HTTPS
- Set secure cookie flags
- Implement rate limiting
- Add input sanitization
- Regular security audits

## Support
For technical issues or questions about the implementation, refer to:
- Stripe Documentation: https://stripe.com/docs
- Node.js SQLite3: https://github.com/TryGhost/node-sqlite3
- Express.js: https://expressjs.com/

## Next Steps (Phase 3)
The foundation is now ready for Phase 3: Marketing & Automation Engine:
- Email/SMS campaigns with SendGrid/Twilio
- Automated drip campaigns
- Referral program implementation
- Advanced workflow automation
