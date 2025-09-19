// CRM Application - Direct Access
console.log('🚀 CRM App Starting...');

let currentView = 'dashboard';

// Navigation handler
document.addEventListener('click', (e) => {
    if (e.target.matches('.nav-item') || e.target.closest('.nav-item')) {
        e.preventDefault();
        const navItem = e.target.matches('.nav-item') ? e.target : e.target.closest('.nav-item');
        const href = navItem.getAttribute('href');
        if (href && href.startsWith('#/')) {
            loadView(href.substring(2));
        }
    }
});

// Load view function
async function loadView(viewName) {
    console.log(`📄 Loading: ${viewName}`);
    currentView = viewName;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('text-primary', 'bg-gray-100');
        item.classList.add('text-gray-700');
    });
    
    const activeNav = document.querySelector(`[href="#/${viewName}"]`);
    if (activeNav) {
        activeNav.classList.add('text-primary', 'bg-gray-100');
        activeNav.classList.remove('text-gray-700');
    }

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    }

    // Load content
    try {
        switch (viewName) {
            case 'dashboard':
                await loadDashboardView();
                break;
            case 'calendar':
                await loadCalendarView();
                break;
            case 'subscriptions':
                await loadSubscriptionsView();
                break;
            case 'invoices':
                await loadInvoicesView();
                break;
            case 'reports':
                await loadReportsView();
                break;
            case 'templates':
                await loadTemplatesView();
                break;
            case 'admin':
                await loadAdminView();
                break;
            default:
                await loadDashboardView();
        }
    } catch (error) {
        console.error(`❌ Error loading ${viewName}:`, error);
        document.getElementById('app').innerHTML = `
            <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 class="text-red-800 font-medium">Error Loading ${viewName}</h3>
                    <p class="text-red-700 mt-2">${error.message}</p>
                    <button onclick="loadView('${viewName}')" class="mt-3 bg-red-100 px-3 py-2 rounded text-red-800 hover:bg-red-200">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

// Dashboard view
async function loadDashboardView() {
    console.log('📊 Loading dashboard...');
    
    const response = await fetch('/api/contacts');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contacts = await response.json();

    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">Patient Management</h2>
                <p class="text-gray-600">Manage your patients and their information</p>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Patients</p>
                            <p class="text-2xl font-semibold text-gray-900">${contacts.length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Active Clients</p>
                            <p class="text-2xl font-semibold text-gray-900">${contacts.filter(c => c.status === 'Client').length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-yellow-100 rounded-lg">
                            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">New Leads</p>
                            <p class="text-2xl font-semibold text-gray-900">${contacts.filter(c => c.status === 'Lead').length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-purple-100 rounded-lg">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">This Month</p>
                            <p class="text-2xl font-semibold text-gray-900">${contacts.filter(c => {
                                const created = new Date(c.created_at);
                                const now = new Date();
                                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                            }).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Patients Table -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Recent Patients</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${contacts.map(contact => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                                <span class="text-white font-medium">${contact.first_name.charAt(0)}${contact.last_name.charAt(0)}</span>
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900">
                                                    <a href="patient-profile.html?id=${contact.id}" class="text-primary hover:text-primary-dark cursor-pointer">
                                                        ${contact.first_name} ${contact.last_name}
                                                    </a>
                                                </div>
                                                <div class="text-sm text-gray-500">ID: ${contact.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">${contact.email}</div>
                                        <div class="text-sm text-gray-500">${contact.phone || 'No phone'}</div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-sm text-gray-900 max-w-xs truncate">${contact.primary_complaint || 'No complaint'}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contact.status === 'Client' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                            ${contact.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onclick="viewPatient(${contact.id})" class="text-primary hover:text-primary-dark mr-3">View</button>
                                        <button onclick="editPatient(${contact.id})" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                        <button onclick="deletePatient(${contact.id})" class="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 CRM Initialized - Direct Access Mode');
    loadView('dashboard');
});

// Patient Management Functions
async function viewPatient(patientId) {
    console.log(`👁️ Viewing patient ${patientId}`);
    
    try {
        const response = await fetch(`/api/contacts/${patientId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const patient = await response.json();
        
        // Show patient details modal
        showPatientModal(patient, 'view');
    } catch (error) {
        console.error('❌ Error viewing patient:', error);
        showNotification('Error loading patient details', 'error');
    }
}

async function editPatient(patientId) {
    console.log(`✏️ Editing patient ${patientId}`);
    
    try {
        const response = await fetch(`/api/contacts/${patientId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const patient = await response.json();
        
        // Show patient edit modal
        showPatientModal(patient, 'edit');
    } catch (error) {
        console.error('❌ Error loading patient for edit:', error);
        showNotification('Error loading patient details', 'error');
    }
}

async function deletePatient(patientId) {
    console.log(`🗑️ Deleting patient ${patientId}`);
    
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/contacts/${patientId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showNotification('Patient deleted successfully', 'success');
        loadDashboardView(); // Refresh the dashboard
    } catch (error) {
        console.error('❌ Error deleting patient:', error);
        showNotification('Error deleting patient', 'error');
    }
}

function showPatientModal(patient, mode) {
    const isReadOnly = mode === 'view';
    const modalTitle = mode === 'view' ? 'Patient Details' : 'Edit Patient';
    
    const modalHTML = `
        <div id="patientModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">${modalTitle}</h3>
                        <button onclick="closePatientModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="patientForm" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" name="first_name" value="${patient.first_name || ''}" 
                                       ${isReadOnly ? 'readonly' : ''} 
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm ${isReadOnly ? 'bg-gray-50' : 'focus:ring-primary focus:border-primary'}">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" name="last_name" value="${patient.last_name || ''}" 
                                       ${isReadOnly ? 'readonly' : ''} 
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm ${isReadOnly ? 'bg-gray-50' : 'focus:ring-primary focus:border-primary'}">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" value="${patient.email || ''}" 
                                       ${isReadOnly ? 'readonly' : ''} 
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm ${isReadOnly ? 'bg-gray-50' : 'focus:ring-primary focus:border-primary'}">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="tel" name="phone" value="${patient.phone || ''}" 
                                       ${isReadOnly ? 'readonly' : ''} 
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm ${isReadOnly ? 'bg-gray-50' : 'focus:ring-primary focus:border-primary'}">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Primary Complaint</label>
                            <textarea name="primary_complaint" rows="3" ${isReadOnly ? 'readonly' : ''} 
                                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm ${isReadOnly ? 'bg-gray-50' : 'focus:ring-primary focus:border-primary'}">${patient.primary_complaint || ''}</textarea>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" ${isReadOnly ? 'disabled' : ''} 
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm ${isReadOnly ? 'bg-gray-50' : 'focus:ring-primary focus:border-primary'}">
                                    <option value="Lead" ${patient.status === 'Lead' ? 'selected' : ''}>Lead</option>
                                    <option value="Client" ${patient.status === 'Client' ? 'selected' : ''}>Client</option>
                                    <option value="Inactive" ${patient.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Source</label>
                                <input type="text" name="source" value="${patient.source || ''}" 
                                       ${isReadOnly ? 'readonly' : ''} 
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm ${isReadOnly ? 'bg-gray-50' : 'focus:ring-primary focus:border-primary'}">
                            </div>
                        </div>
                        
                        ${!isReadOnly ? `
                            <div class="flex justify-end space-x-3 pt-4">
                                <button type="button" onclick="closePatientModal()" 
                                        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" 
                                        class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                                    Save Changes
                                </button>
                            </div>
                        ` : `
                            <div class="flex justify-end pt-4">
                                <button type="button" onclick="closePatientModal()" 
                                        class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                                    Close
                                </button>
                            </div>
                        `}
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler for edit mode
    if (!isReadOnly) {
        document.getElementById('patientForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await savePatientChanges(patient.id, new FormData(e.target));
        });
    }
}

function closePatientModal() {
    const modal = document.getElementById('patientModal');
    if (modal) {
        modal.remove();
    }
}

async function savePatientChanges(patientId, formData) {
    console.log(`💾 Saving changes for patient ${patientId}`);
    
    try {
        const data = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            primary_complaint: formData.get('primary_complaint'),
            status: formData.get('status'),
            source: formData.get('source')
        };
        
        const response = await fetch(`/api/contacts/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showNotification('Patient updated successfully', 'success');
        closePatientModal();
        loadDashboardView(); // Refresh the dashboard
    } catch (error) {
        console.error('❌ Error saving patient:', error);
        showNotification('Error saving patient changes', 'error');
    }
}
