document.addEventListener('DOMContentLoaded', () => {
    const tabContent = document.getElementById('tabContent');

    const switchTab = (tabName) => {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('border-indigo-500', 'text-indigo-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });
        
        const activeBtn = document.querySelector(`button[onclick="switchTab('${tabName}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('border-indigo-500', 'text-indigo-600');
            activeBtn.classList.remove('border-transparent', 'text-gray-500');
        }

        // Load tab content
        switch(tabName) {
            case 'profile':
                loadProfileTab();
                break;
            case 'appointments':
                loadAppointmentsTab();
                break;
            case 'billing':
                loadBillingTab();
                break;
        }
    };

    const loadProfileTab = async () => {
        tabContent.innerHTML = 'Loading profile...';
        // In a real app, you would get the patient ID from the session
        const patientId = 1; // Hardcoded for now
        const response = await fetch(`/api/contacts/${patientId}`);
        const patient = await response.json();
        tabContent.innerHTML = `
            <div>
                <h2 class="text-xl font-bold mb-4">My Profile</h2>
                <p><strong>Name:</strong> ${patient.first_name} ${patient.last_name}</p>
                <p><strong>Email:</strong> ${patient.email}</p>
                <p><strong>Phone:</strong> ${patient.phone}</p>
                <p><strong>Primary Complaint:</strong> ${patient.primary_complaint}</p>
            </div>
        `;
    };

    const loadAppointmentsTab = async () => {
        tabContent.innerHTML = 'Loading appointments...';
        // In a real app, you would get the patient ID from the session
        const patientId = 1; // Hardcoded for now
        const response = await fetch(`/api/patients/${patientId}/appointments`);
        const appointments = await response.json();
        tabContent.innerHTML = `
            <div>
                <h2 class="text-xl font-bold mb-4">My Appointments</h2>
                <ul>
                    ${appointments.map(appt => `<li>${new Date(appt.date_time).toLocaleString()} - ${appt.type}</li>`).join('')}
                </ul>
            </div>
        `;
    };

    const loadBillingTab = async () => {
        tabContent.innerHTML = 'Loading billing...';
        // In a real app, you would get the patient ID from the session
        const patientId = 1; // Hardcoded for now
        const response = await fetch(`/api/invoices?contact_id=${patientId}`);
        const invoices = await response.json();
        tabContent.innerHTML = `
            <div>
                <h2 class="text-xl font-bold mb-4">My Invoices</h2>
                <ul>
                    ${invoices.map(inv => `<li>${inv.service_description} - $${inv.amount} (${inv.status})</li>`).join('')}
                </ul>
            </div>
        `;
    };

    // Make switchTab globally accessible
    window.switchTab = switchTab;

    // Load default tab
    switchTab('profile');
});
