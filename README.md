# Posture Perfect CRM System

A comprehensive CRM system designed specifically for physical therapy practices, featuring patient management, appointment scheduling, treatment tracking, invoicing, and business intelligence.

## 🚀 Features

### Core Functionality
- **Patient Management**: Complete contact database with lead tracking
- **Patient Profiles**: Detailed patient history with assessments and session logs
- **Appointment Scheduling**: Calendar-based appointment management
- **Treatment Tracking**: Session notes, pain levels, and homework assignments
- **Invoicing System**: Create and track invoices with payment status
- **Business Intelligence**: Revenue reports, conversion rates, and analytics
- **Treatment Templates**: Standardized treatment plans for quick deployment

### Advanced Features
- **Timeline View**: Complete patient interaction history
- **Pain Level Tracking**: Pre/post session pain monitoring
- **Assessment Forms**: Structured initial assessment documentation
- **Website Integration**: Lead capture from external websites
- **Visual Reports**: Chart.js powered analytics dashboard

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## 🛠️ Installation

1. **Clone or download the project**
   ```bash
   cd posture-perfect-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to: `http://localhost:3000`

## 🚀 Production Deployment

### Quick Deploy
```bash
npm run deploy
```

### Manual Deployment
1. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

2. **Install production dependencies**
   ```bash
   npm install --production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Environment Configuration
Create a `.env` file based on `.env.example`:
```
PORT=3000
NODE_ENV=production
DB_PATH=./crm.db
```

## 📊 Database Schema

### Core Tables
- **contacts**: Patient/contact information
- **patient_assessments**: Initial assessment records
- **patient_sessions**: Treatment session logs
- **appointments**: Appointment scheduling
- **tasks**: Task management
- **invoices**: Billing and payment tracking
- **treatment_plans**: Standardized treatment templates

## 🔗 API Endpoints

### Contacts/Patients
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get contact details
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Patient Profiles
- `POST /api/patients/:id/assessment` - Add assessment
- `GET /api/patients/:id/assessments` - Get assessments
- `POST /api/patients/:id/session` - Log session
- `GET /api/patients/:id/sessions` - Get sessions
- `GET /api/patients/:id/timeline` - Get complete timeline

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Invoicing
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice status

### Reports
- `GET /api/reports/leads-per-month` - Monthly lead statistics
- `GET /api/reports/conversion-rate` - Lead conversion metrics
- `GET /api/reports/revenue-per-month` - Revenue analytics

### Treatment Plans
- `GET /api/treatment-plans` - List treatment templates
- `GET /api/treatment-plans/:id` - Get specific template

## 🎯 Usage Guide

### 1. Dashboard Overview
- View all patients/contacts in a sortable table
- Click patient names to access detailed profiles
- Quick actions: View, Edit, Delete contacts

### 2. Patient Profiles
- Complete patient information display
- Add initial assessments with therapist notes
- Log treatment sessions with pain tracking
- View chronological timeline of all interactions

### 3. Appointment Management
- Calendar view of upcoming appointments
- Link appointments to existing patients
- Track appointment status (Scheduled, Completed, Cancelled)

### 4. Invoicing
- Create invoices linked to patients
- Track payment status (Sent, Paid, Overdue)
- Service description and amount tracking

### 5. Business Reports
- Visual charts showing lead trends
- Conversion rate calculations
- Monthly revenue tracking
- Export-ready data formats

### 6. Treatment Templates
- Pre-built treatment plans
- Quick deployment to patients
- Standardized pricing and descriptions

## 🔧 Customization

### Adding New Fields
1. Update the relevant SQL schema file
2. Modify the API endpoints in `server.js`
3. Update the frontend forms and displays

### Styling Changes
- Modify `public/styles.css` for visual customizations
- All styles use CSS Grid and Flexbox for responsiveness

### Database Modifications
- Schema files are in the root directory (`*-db.sql`)
- Database initialization handles all table creation automatically

## 🛡️ Security Features

- Input validation and sanitization
- SQL injection prevention through parameterized queries
- XSS protection with HTML escaping
- Error handling with user-friendly messages
- Request logging for monitoring

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

## 🔍 Troubleshooting

### Common Issues

1. **Database not initializing**
   - Check file permissions in the project directory
   - Ensure SQLite3 is properly installed

2. **Port already in use**
   - Change the PORT in `.env` file
   - Kill existing processes: `pkill -f node`

3. **Charts not displaying**
   - Ensure internet connection for Chart.js CDN
   - Check browser console for JavaScript errors

### Logs and Debugging
- Server logs include timestamps and request details
- Check browser console for frontend errors
- Database errors are logged with descriptive messages

## 📈 Performance Optimization

- Database indexes on frequently queried fields
- Efficient SQL queries with proper JOINs
- Frontend loading states and error handling
- Responsive design for mobile devices

## 🔄 Backup and Recovery

### Automatic Backups
The deployment script automatically creates database backups with timestamps.

### Manual Backup
```bash
cp crm.db crm_backup_$(date +%Y%m%d_%H%M%S).db
```

### Recovery
```bash
cp crm_backup_YYYYMMDD_HHMMSS.db crm.db
```

## 📞 Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

## 📄 License

This project is licensed under the MIT License - see the package.json file for details.
