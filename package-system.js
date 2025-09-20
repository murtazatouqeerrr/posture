// Module 2: Package System & Tracking
const fs = require('fs');
const path = require('path');

// Enhanced database with package system
const enhancedDB = {
    "contacts": [
        {
            "id": 100,
            "first_name": "Emily",
            "last_name": "Johnson",
            "email": "emily.johnson@email.com",
            "phone": "555-0199",
            "primary_complaint": "Chronic lower back pain",
            "status": "Client",
            "pre_visit_status": {
                "intake_forms_sent": true,
                "intake_forms_completed": true,
                "cc_on_file": true,
                "first_appointment_scheduled": true
            },
            "created_at": "2024-09-19T10:00:00Z"
        }
    ],
    "packages": [
        {
            "id": 1,
            "name": "6-Session Starter Package",
            "number_of_sessions": 6,
            "price": 450.00,
            "description": "Perfect for addressing specific posture issues"
        },
        {
            "id": 2,
            "name": "12-Session Complete Package",
            "number_of_sessions": 12,
            "price": 800.00,
            "description": "Comprehensive posture correction program"
        },
        {
            "id": 3,
            "name": "24-Session Premium Package",
            "number_of_sessions": 24,
            "price": 1400.00,
            "description": "Full transformation program with ongoing support"
        }
    ],
    "patient_packages": [
        {
            "id": 1,
            "patient_id": 100,
            "package_id": 2,
            "purchase_date": "2024-09-19T12:00:00Z",
            "sessions_remaining": 10,
            "is_active": true,
            "total_sessions": 12,
            "sessions_used": 2
        }
    ],
    "appointments": [
        {
            "id": 1,
            "patient_id": 100,
            "patient_package_id": 1,
            "appointment_date": "2024-09-20T14:00:00Z",
            "status": "completed",
            "session_type": "Initial Assessment"
        },
        {
            "id": 2,
            "patient_id": 100,
            "patient_package_id": 1,
            "appointment_date": "2024-09-22T14:00:00Z",
            "status": "completed",
            "session_type": "Treatment Session"
        }
    ],
    "onboarding_tasks": [],
    "automated_emails": [],
    "intake_forms": [],
    "users": [
        {
            "id": 1,
            "username": "admin",
            "password_hash": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
            "name": "Admin User",
            "role": "admin"
        }
    ],
    "patient_logins": [],
    "patient_assessments": [],
    "patient_sessions": [],
    "tasks": [],
    "invoices": []
};

// Write enhanced database
fs.writeFileSync(path.join(__dirname, 'enhanced_db.json'), JSON.stringify(enhancedDB, null, 2));

console.log('✅ Package System Database Created');
console.log('📦 Available Packages:');
enhancedDB.packages.forEach(pkg => {
    console.log(`   - ${pkg.name}: ${pkg.number_of_sessions} sessions for $${pkg.price}`);
});
console.log('👤 Sample Patient Package:');
console.log(`   - Emily Johnson has ${enhancedDB.patient_packages[0].sessions_remaining} sessions remaining`);

// Package System API Functions
const packageAPI = {
    // Get all packages
    getPackages: (req, res) => {
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'enhanced_db.json'), 'utf8'));
        res.json(db.packages);
    },

    // Purchase package for patient
    purchasePackage: (req, res) => {
        const { packageId } = req.body;
        const patientId = parseInt(req.params.id);
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'enhanced_db.json'), 'utf8'));
        
        const package = db.packages.find(p => p.id === parseInt(packageId));
        if (!package) {
            return res.status(404).json({ error: 'Package not found' });
        }
        
        // Deactivate existing packages
        db.patient_packages.forEach(pp => {
            if (pp.patient_id === patientId) {
                pp.is_active = false;
            }
        });
        
        const purchaseId = Math.max(...db.patient_packages.map(p => p.id), 0) + 1;
        const newPurchase = {
            id: purchaseId,
            patient_id: patientId,
            package_id: parseInt(packageId),
            purchase_date: new Date().toISOString(),
            sessions_remaining: package.number_of_sessions,
            total_sessions: package.number_of_sessions,
            sessions_used: 0,
            is_active: true
        };
        
        db.patient_packages.push(newPurchase);
        fs.writeFileSync(path.join(__dirname, 'enhanced_db.json'), JSON.stringify(db, null, 2));
        
        res.json({ success: true, purchase_id: purchaseId, package: newPurchase });
    },

    // Get patient packages
    getPatientPackages: (req, res) => {
        const patientId = parseInt(req.params.id);
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'enhanced_db.json'), 'utf8'));
        
        const patientPackages = db.patient_packages
            .filter(pp => pp.patient_id === patientId)
            .map(pp => {
                const package = db.packages.find(p => p.id === pp.package_id);
                return { ...pp, package_details: package };
            });
        
        res.json(patientPackages);
    },

    // Use session (decrement sessions_remaining)
    useSession: (req, res) => {
        const { patientPackageId } = req.body;
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'enhanced_db.json'), 'utf8'));
        
        const patientPackage = db.patient_packages.find(pp => pp.id === parseInt(patientPackageId));
        if (!patientPackage) {
            return res.status(404).json({ error: 'Patient package not found' });
        }
        
        if (patientPackage.sessions_remaining <= 0) {
            return res.status(400).json({ error: 'No sessions remaining' });
        }
        
        patientPackage.sessions_remaining--;
        patientPackage.sessions_used++;
        
        if (patientPackage.sessions_remaining === 0) {
            patientPackage.is_active = false;
        }
        
        fs.writeFileSync(path.join(__dirname, 'enhanced_db.json'), JSON.stringify(db, null, 2));
        
        res.json({ 
            success: true, 
            sessions_remaining: patientPackage.sessions_remaining,
            package: patientPackage 
        });
    },

    // Check if patient can book appointment
    canBookAppointment: (req, res) => {
        const patientId = parseInt(req.params.id);
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'enhanced_db.json'), 'utf8'));
        
        const activePackage = db.patient_packages.find(pp => 
            pp.patient_id === patientId && pp.is_active && pp.sessions_remaining > 0
        );
        
        res.json({ 
            can_book: !!activePackage,
            active_package: activePackage,
            sessions_remaining: activePackage ? activePackage.sessions_remaining : 0
        });
    }
};

module.exports = { packageAPI, enhancedDB };
