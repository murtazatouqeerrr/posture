// CRM Application - Direct Access
console.log('🚀 CRM App Starting...');

// Utility function to safely get values and prevent undefined
function safeValue(value, defaultValue = '') {
    if (value === null || value === undefined || value === 'undefined') {
        // Return appropriate defaults based on context
        if (defaultValue === '') {
            return 'Not Available';
        }
        return defaultValue;
    }
    return value;
}

// Utility function to safely format dates
function safeDate(dateString) {
    if (!dateString || dateString === 'undefined') return 'No Date Set';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return 'Invalid Date';
    }
}

// Utility function to safely format currency
function safeCurrency(amount) {
    if (amount === null || amount === undefined || amount === 'undefined') return '$0.00';
    const num = parseFloat(amount);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
}

// Utility function for safe text display
function safeText(text, placeholder = 'No Information') {
    if (!text || text === 'undefined' || text === null) return placeholder;
    return text;
}

// Utility function for safe numbers
function safeNumber(num, defaultNum = 0) {
    if (num === null || num === undefined || num === 'undefined' || isNaN(num)) return defaultNum;
    return parseInt(num) || defaultNum;
}

// Utility function for safe status
function safeStatus(status) {
    if (!status || status === 'undefined') return 'Active';
    return status;
}

// Global error handler for fetch requests
async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error);
        throw error;
    }
}

let currentView = 'dashboard';

// Global function for subscribe button
window.subscribeToPackage = function(packageId) {
    alert(`Subscribing to package ${packageId}. This feature will be implemented with payment integration.`);
};

// Global function for subscribe button
window.subscribeToPackage = function(packageId) {
    alert(`Subscribing to package ${packageId}. This feature will be implemented with payment integration.`);
};

// Package sidebar functions
window.showAllPackages = function() {
    loadPackagesView();
};

window.showActiveSubscriptions = function() {
    const content = document.getElementById('package-content');
    if (content) {
        content.innerHTML = `
            <div class="header-section mb-6">
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Active Subscriptions</h1>
                <p class="text-gray-600">Manage your current subscriptions</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
                <p class="text-gray-500">No active subscriptions found.</p>
            </div>
        `;
    }
};

window.showPackageAnalytics = function() {
    const content = document.getElementById('package-content');
    if (content) {
        content.innerHTML = `
            <div class="header-section mb-6">
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Package Analytics</h1>
                <p class="text-gray-600">View package performance metrics</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
                <p class="text-gray-500">Analytics dashboard coming soon...</p>
            </div>
        `;
    }
};

window.showAddPackageForm = function() {
    const content = document.getElementById('package-content');
    if (content) {
        content.innerHTML = `
            <div class="header-section mb-6">
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Add New Package</h1>
                <p class="text-gray-600">Create a new treatment package</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
                <form class="space-y-4">
                    <input type="text" placeholder="Package Name" class="w-full border rounded px-3 py-2" required>
                    <input type="number" placeholder="Number of Sessions" class="w-full border rounded px-3 py-2" required>
                    <input type="number" placeholder="Price" step="0.01" class="w-full border rounded px-3 py-2" required>
                    <textarea placeholder="Description" class="w-full border rounded px-3 py-2" rows="3"></textarea>
                    <button type="submit" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Add Package</button>
                </form>
            </div>
        `;
    }
};

// Pre-visit sidebar functions
window.showPreVisitForm = function() {
    loadPreVisitView();
};

window.showPreVisitInstructions = function() {
    const content = document.getElementById('previsit-content');
    if (content) {
        content.innerHTML = `
            <div class="header-section mb-6">
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Pre-Visit Instructions</h1>
                <p class="text-gray-600">Important information for your appointment</p>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
                <ul class="space-y-3 text-gray-700">
                    <li>• Arrive 15 minutes early for your appointment</li>
                    <li>• Bring a valid ID and insurance card</li>
                    <li>• Wear comfortable, loose-fitting clothing</li>
                    <li>• Bring any recent medical reports or imaging results</li>
                </ul>
            </div>
        `;
    }
};

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
            case 'campaigns':
                await loadCampaignsView();
                break;
            case 'automation':
                await showAutomationPanel();
                break;
            case 'feedback':
                await showFeedbackPanel();
                break;
            case 'packages':
                await loadPackagesView();
                break;
            case 'pre-visit':
                await loadPreVisitView();
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

async function loadAdminView() {
    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">⚙️ Admin Dashboard</h2>
                <p class="text-gray-600">System administration and settings</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <p class="text-gray-500">Admin dashboard coming soon...</p>
            </div>
        </div>
    `;
}

async function loadCampaignsView() {
    try {
        console.log('📢 Loading campaigns view...');
        const response = await fetch('/campaigns');
        if (!response.ok) {
            throw new Error(`Failed to load campaigns: ${response.status}`);
        }
        const html = await response.text();
        
        // Extract the main content from campaigns.html
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mainContent = doc.querySelector('main') || doc.querySelector('.container') || doc.body;
        
        document.getElementById('app').innerHTML = mainContent.innerHTML;
        
        // Load campaigns.js script if it exists
        const script = document.createElement('script');
        script.src = '/campaigns.js';
        script.onload = () => {
            console.log('✅ Campaigns script loaded');
            // Initialize campaigns if function exists
            if (typeof initializeCampaigns === 'function') {
                initializeCampaigns();
            }
        };
        script.onerror = () => {
            console.log('⚠️ Campaigns script not found, loading basic view');
        };
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('❌ Campaigns loading error:', error);
        document.getElementById('app').innerHTML = `
            <div class="error-message">
                <h2>Error Loading Campaigns</h2>
                <p>Unable to load campaigns view: ${error.message}</p>
            </div>
        `;
    }
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

// NEW MODULE FUNCTIONS

// Automation Hub Panel
async function showAutomationPanel() {
    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">🤖 Automation Hub</h2>
                <p class="text-gray-600">Manage and monitor all automation systems</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 class="font-semibold text-blue-800 mb-2">Pre-Visit Automation</h3>
                    <p class="text-blue-600 text-sm mb-4">Automatically triggered when lead converts to client</p>
                    <button onclick="triggerPreVisitDemo()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Test Demo
                    </button>
                </div>
                
                <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 class="font-semibold text-green-800 mb-2">Nudge System</h3>
                    <p class="text-green-600 text-sm mb-4">Low sessions, renewals, dormant patients</p>
                    <button onclick="triggerNudgeSystem()" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                        Run Nudges
                    </button>
                </div>
                
                <div class="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h3 class="font-semibold text-purple-800 mb-2">Package Tracking</h3>
                    <p class="text-purple-600 text-sm mb-4">Session usage and renewals</p>
                    <a href="/packages" class="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                        Manage Packages
                    </a>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="font-semibold text-gray-800 mb-4">Recent Automation Activity</h3>
                <div id="automationLog" class="space-y-2">
                    <div class="text-sm text-gray-600">Loading automation history...</div>
                </div>
            </div>
        </div>
    `;
    
    loadAutomationHistory();
}

// Feedback & Reviews Panel
async function showFeedbackPanel() {
    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">⭐ Feedback & Reviews</h2>
                <p class="text-gray-600">Manage review requests and patient feedback</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <h3 class="font-semibold text-yellow-800 mb-2">Review Requests</h3>
                    <p class="text-yellow-600 text-sm mb-4">Only sent to successful package completers</p>
                    <button onclick="requestFeedbackDemo()" class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                        Request Demo
                    </button>
                </div>
                
                <div class="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                    <h3 class="font-semibold text-indigo-800 mb-2">Feedback History</h3>
                    <p class="text-indigo-600 text-sm mb-4">Track review requests and responses</p>
                    <button onclick="loadFeedbackHistory()" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                        Refresh History
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="font-semibold text-gray-800 mb-4">Feedback Activity</h3>
                <div id="feedbackLog" class="space-y-2">
                    <div class="text-sm text-gray-600">Loading feedback history...</div>
                </div>
            </div>
        </div>
    `;
    
    loadFeedbackHistory();
}

// Trigger functions
async function triggerPreVisitDemo() {
    try {
        const response = await fetch('/api/patients/100/trigger-automation', {
            method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
            showNotification('Pre-visit automation triggered for Emily Johnson!', 'success');
            loadAutomationHistory();
        }
    } catch (error) {
        showNotification('Error triggering automation', 'error');
    }
}

async function triggerNudgeSystem() {
    try {
        const response = await fetch('/api/nudge/trigger', {
            method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Nudge system executed: ${result.results.low_sessions} low session warnings, ${result.results.renewals} renewals, ${result.results.dormant} dormant reactivations`, 'success');
            loadAutomationHistory();
        }
    } catch (error) {
        showNotification('Error running nudge system', 'error');
    }
}

async function requestFeedbackDemo() {
    try {
        const response = await fetch('/api/patients/100/request-feedback', {
            method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
            showNotification('Feedback request sent to Emily Johnson!', 'success');
            loadFeedbackHistory();
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        showNotification('Error requesting feedback', 'error');
    }
}

async function loadAutomationHistory() {
    try {
        const response = await fetch('/api/automation/history');
        const history = await response.json();
        
        const logDiv = document.getElementById('automationLog');
        if (history.length === 0) {
            logDiv.innerHTML = '<div class="text-sm text-gray-500">No automation activity yet</div>';
            return;
        }
        
        logDiv.innerHTML = history.slice(0, 10).map(item => `
            <div class="flex justify-between items-center p-2 bg-white rounded border">
                <div>
                    <span class="font-medium">${item.automation_type}</span>
                    <span class="text-gray-500 text-sm">- ${item.first_name} ${item.last_name}</span>
                </div>
                <span class="text-xs text-gray-400">${new Date(item.created_at).toLocaleString()}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading automation history:', error);
    }
}

async function loadFeedbackHistory() {
    try {
        const response = await fetch('/api/nudge/history');
        const emails = await response.json();
        
        const feedbackEmails = emails.filter(email => email.email_type === 'feedback_request');
        
        const logDiv = document.getElementById('feedbackLog');
        if (feedbackEmails.length === 0) {
            logDiv.innerHTML = '<div class="text-sm text-gray-500">No feedback requests sent yet</div>';
            return;
        }
        
        logDiv.innerHTML = feedbackEmails.map(email => `
            <div class="flex justify-between items-center p-2 bg-white rounded border">
                <div>
                    <span class="font-medium">Review Request</span>
                    <span class="text-gray-500 text-sm">- Patient ID: ${email.patient_id}</span>
                </div>
                <span class="text-xs text-gray-400">${new Date(email.sent_at).toLocaleString()}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading feedback history:', error);
    }
}

// Missing View Functions
async function loadCalendarView() {
    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">📅 Calendar</h2>
                <p class="text-gray-600">Manage appointments and scheduling</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <p class="text-gray-500">Calendar functionality coming soon...</p>
            </div>
        </div>
    `;
}

async function loadSubscriptionsView() {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="p-6">Loading...</div>`;

    // Fetch patients and plans
    const [contacts, plans] = await Promise.all([
        safeFetch('/api/contacts').catch(() => []),
        safeFetch('/api/subscription-plans').catch(() => [])
    ]);

    // Build patient dropdown
    const patientDropdown = `
        <label class="block mb-4">
            <span class="text-gray-700 font-medium">Select Patient:</span>
            <select id="planPatientSelect" class="mt-1 w-full border rounded px-3 py-2">
                <option value="">-- Select Patient --</option>
                ${contacts.map(c => `<option value="${c.id}">${safeText(c.first_name)} ${safeText(c.last_name)} (${safeText(c.email)})</option>`).join('')}
            </select>
        </label>
    `;

    // Build plans list
    const plansList = plans.map(plan => `
        <div class="bg-white rounded-lg shadow-md p-6 border mb-4">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">${safeText(plan.name, 'Subscription Plan')}</h3>
            <p class="text-gray-600 mb-4">${safeText(plan.description, 'No description')}</p>
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-500">Price:</span>
                <span class="font-bold text-green-600">${safeCurrency(plan.price)}</span>
            </div>
            <div class="flex justify-between items-center mb-4">
                <span class="text-sm text-gray-500">Interval:</span>
                <span class="font-medium">${safeText(plan.billing_interval)}</span>
            </div>
            <button 
                class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors subscribe-plan-btn"
                data-plan-id="${plan.id}">
                Subscribe Selected Patient
            </button>
        </div>
    `).join('');

    app.innerHTML = `
        <div class="subscriptions-management">
            <div class="header-section mb-6">
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Subscription Management</h1>
                <p class="text-gray-600">Subscribe patients to plans</p>
            </div>
            <div class="mb-6">${patientDropdown}</div>
            <div>${plansList}</div>
            <div id="planSubscribeMsg" class="mt-6"></div>
        </div>
    `;

    // Add event listeners for subscribe buttons
    document.querySelectorAll('.subscribe-plan-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const userId = document.getElementById('planPatientSelect').value;
            const planId = this.getAttribute('data-plan-id');
            const msgDiv = document.getElementById('planSubscribeMsg');
            msgDiv.textContent = '';
            if (!userId) {
                msgDiv.innerHTML = `<div class="text-red-600 font-medium">Please select a patient first.</div>`;
                return;
            }
            // Call backend to subscribe
            try {
                const res = await safeFetch('/api/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contact_id: userId,
                        plan_id: planId
                    })
                });
                msgDiv.innerHTML = `<div class="text-green-600 font-medium">Patient subscribed to plan successfully!</div>`;
            } catch (err) {
                msgDiv.innerHTML = `<div class="text-red-600 font-medium">Error subscribing: ${err.message}</div>`;
            }
        });
    });
}

async function loadInvoicesView() {
    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">📄 Invoices</h2>
                <p class="text-gray-600">Manage billing and invoices</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <p class="text-gray-500">Invoice management coming soon...</p>
            </div>
        </div>
    `;
}

async function loadReportsView() {
    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">📊 Reports</h2>
                <p class="text-gray-600">Analytics and business intelligence</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <p class="text-gray-500">Reports and analytics coming soon...</p>
            </div>
        </div>
    `;
}

async function loadTemplatesView() {
    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">📋 Templates</h2>
                <p class="text-gray-600">Treatment plan templates</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <p class="text-gray-500">Template management coming soon...</p>
            </div>
        </div>
    `;
}

async function loadPackagesView() {
    try {
        console.log('📦 Loading packages view...');
        const mainContent = document.getElementById('app');
        if (!mainContent) {
            console.error('❌ No app element found');
            return;
        }

        // Fetch packages and contacts
        const [packages, contacts] = await Promise.all([
            safeFetch('/api/packages').catch(() => []),
            safeFetch('/api/contacts').catch(() => [])
        ]);

        // Fallback demo data if needed
        const pkgList = (packages && packages.length) ? packages : [
            { id: 1, name: 'Starter Package', description: 'Perfect for beginners - includes 4 treatment sessions', number_of_sessions: 4, price: 299.99 },
            { id: 2, name: 'Standard Package', description: 'Most popular choice - 8 comprehensive sessions', number_of_sessions: 8, price: 549.99 },
            { id: 3, name: 'Premium Package', description: 'Complete treatment plan with 12 sessions', number_of_sessions: 12, price: 799.99 }
        ];

        // Build user dropdown
        const userDropdown = `
            <label class="block mb-4">
                <span class="text-gray-700 font-medium">Select Patient to Subscribe:</span>
                <select id="packageUserSelect" class="mt-1 w-full border rounded px-3 py-2">
                    <option value="">-- Select Patient --</option>
                    ${contacts.map(c => `<option value="${c.id}">${safeText(c.first_name)} ${safeText(c.last_name)} (${safeText(c.email)})</option>`).join('')}
                </select>
            </label>
        `;

        // Render packages and dropdown
        mainContent.innerHTML = `
            <div class="packages-management">
                <div class="header-section mb-6">
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Package Management</h1>
                    <p class="text-gray-600">Manage treatment packages and subscriptions</p>
                </div>
                <div class="mb-6">${userDropdown}</div>
                <div class="packages-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${pkgList.map(pkg => `
                        <div class="package-card bg-white rounded-lg shadow-md p-6 border">
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">${safeText(pkg.name, 'Treatment Package')}</h3>
                            <p class="text-gray-600 mb-4">${safeText(pkg.description, 'Comprehensive treatment plan designed for your needs')}</p>
                            <div class="package-details mb-4">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-gray-500">Sessions:</span>
                                    <span class="font-medium">${safeNumber(pkg.number_of_sessions, 8)}</span>
                                </div>
                                <div class="flex justify-between items-center mb-4">
                                    <span class="text-sm text-gray-500">Price:</span>
                                    <span class="font-bold text-green-600">${safeCurrency(pkg.price || 299)}</span>
                                </div>
                            </div>
                            <button 
                                class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors subscribe-btn"
                                data-package-id="${pkg.id}">
                                Subscribe Selected Patient
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div id="packageSubscribeMsg" class="mt-6"></div>
            </div>
        `;

        // Add event listeners for subscribe buttons
        document.querySelectorAll('.subscribe-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const userId = document.getElementById('packageUserSelect').value;
                const packageId = this.getAttribute('data-package-id');
                const msgDiv = document.getElementById('packageSubscribeMsg');
                msgDiv.textContent = '';
                if (!userId) {
                    msgDiv.innerHTML = `<div class="text-red-600 font-medium">Please select a patient first.</div>`;
                    return;
                }
                // Call backend to subscribe
                try {
                    const res = await safeFetch('/api/subscriptions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contact_id: userId,
                            package_id: packageId
                        })
                    });
                    msgDiv.innerHTML = `<div class="text-green-600 font-medium">Patient subscribed to package successfully!</div>`;
                } catch (err) {
                    msgDiv.innerHTML = `<div class="text-red-600 font-medium">Error subscribing: ${err.message}</div>`;
                }
            });
        });

    } catch (error) {
        console.error('❌ Packages loading error:', error);
        const mainContent = document.getElementById('app');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Packages</h2>
                    <p>Unable to load packages: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Global function for subscribe button
window.subscribeToPackage = function(packageId) {
    alert(`Subscribing to package ${packageId}. This feature will be implemented with payment integration.`);
};

async function loadPreVisitView() {
    document.getElementById('app').innerHTML = `
        <div class="container mx-auto px-4 py-8">
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Pre-Visit Checklist</h2>
                
                <!-- Patient Selector -->
                <div class="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 class="font-semibold text-blue-800">Select Patient</h3>
                    <select id="patientSelect" class="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">Select a patient...</option>
                    </select>
                </div>

                <!-- Patient Info -->
                <div id="patientInfo" class="mb-6 p-4 bg-blue-50 rounded-lg" style="display:none;">
                    <h3 class="font-semibold text-blue-800">Patient Information</h3>
                    <p id="patientName" class="text-blue-600"></p>
                    <p id="patientEmail" class="text-blue-600"></p>
                </div>

                <!-- Checklist Items -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 border rounded-lg" id="intakeFormsSent">
                        <div class="flex items-center">
                            <div class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center" id="intakeFormsIcon">
                                <svg class="w-4 h-4 text-green-500 hidden" id="intakeFormsCheck" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-medium">Intake Forms Sent</h4>
                                <p class="text-sm text-gray-600">Digital intake forms emailed to patient</p>
                            </div>
                        </div>
                        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onclick="triggerIntakeForms()">
                            Send Forms
                        </button>
                    </div>
                    <div class="flex items-center justify-between p-4 border rounded-lg" id="intakeFormsCompleted">
                        <div class="flex items-center">
                            <div class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center" id="intakeCompletedIcon">
                                <svg class="w-4 h-4 text-green-500 hidden" id="intakeCompletedCheck" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-medium">Intake Forms Completed</h4>
                                <p class="text-sm text-gray-600">Patient has submitted intake forms</p>
                            </div>
                        </div>
                        <span class="text-sm text-gray-500">Waiting for patient</span>
                    </div>
                    <div class="flex items-center justify-between p-4 border rounded-lg" id="ccOnFile">
                        <div class="flex items-center">
                            <div class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center" id="ccIcon">
                                <svg class="w-4 h-4 text-green-500 hidden" id="ccCheck" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-medium">Credit Card on File</h4>
                                <p class="text-sm text-gray-600">Collect payment method for future sessions</p>
                            </div>
                        </div>
                        <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onclick="markCCComplete()">
                            Mark Complete
                        </button>
                    </div>
                    <div class="flex items-center justify-between p-4 border rounded-lg" id="firstAppointment">
                        <div class="flex items-center">
                            <div class="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center" id="appointmentIcon">
                                <svg class="w-4 h-4 text-green-500 hidden" id="appointmentCheck" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-medium">First Appointment Scheduled</h4>
                                <p class="text-sm text-gray-600">Initial assessment appointment booked</p>
                            </div>
                        </div>
                        <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" onclick="scheduleAppointment()">
                            Schedule
                        </button>
                    </div>
                </div>
                <div id="checklistActions" class="mt-6 flex space-x-3"></div>
                <div class="mt-8">
                    <h3 class="text-lg font-semibold mb-4">Onboarding Tasks</h3>
                    <div id="tasksList" class="space-y-2"></div>
                </div>
            </div>
        </div>
    `;

    // JS logic for dropdown, checklist, etc.
    let currentPatientId = null;
    let patientsList = [];

    async function loadPatientsDropdown() {
        const response = await fetch('/api/contacts');
        patientsList = await response.json();
        const select = document.getElementById('patientSelect');
        select.innerHTML = '<option value="">Select a patient...</option>' +
            patientsList.map(p => `<option value="${p.id}">${p.first_name} ${p.last_name} (${p.email})</option>`).join('');
        select.onchange = function() {
            currentPatientId = this.value;
            if (currentPatientId) {
                loadPreVisitChecklist();
            } else {
                document.getElementById('patientInfo').style.display = 'none';
                document.getElementById('checklistActions').innerHTML = '';
                document.getElementById('tasksList').innerHTML = '';
            }
        };
    }

    async function loadPreVisitChecklist() {
        if (!currentPatientId) return;
        try {
            const response = await fetch(`/api/patients/${currentPatientId}/pre-visit-checklist`);
            const data = await response.json();

            document.getElementById('patientInfo').style.display = '';
            document.getElementById('patientName').textContent = `${data.patient.first_name} ${data.patient.last_name}`;
            document.getElementById('patientEmail').textContent = data.patient.email;

            updateChecklistUI(data.pre_visit_status);
            loadTasks(data.tasks);
            showChecklistActions(data.pre_visit_status);
        } catch (error) {
            console.error('Error loading checklist:', error);
        }
    }

    function updateChecklistUI(status) {
        updateCheckItem('intakeFormsSent', status.intake_forms_sent);
        updateCheckItem('intakeFormsCompleted', status.intake_forms_completed);
        updateCheckItem('ccOnFile', status.cc_on_file);
        updateCheckItem('firstAppointment', status.first_appointment_scheduled);
    }

    function updateCheckItem(itemId, completed) {
        const item = document.getElementById(itemId);
        const icon = item.querySelector('[id$="Icon"]');
        const check = item.querySelector('[id$="Check"]');
        if (completed) {
            icon.classList.add('bg-green-500', 'border-green-500');
            check.classList.remove('hidden');
            item.classList.add('bg-green-50');
        } else {
            icon.classList.remove('bg-green-500', 'border-green-500');
            icon.classList.add('border-gray-300');
            check.classList.add('hidden');
            item.classList.remove('bg-green-50');
        }
    }

    function loadTasks(tasks) {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = `p-3 border rounded ${task.status === 'completed' ? 'bg-green-50' : 'bg-yellow-50'}`;
            taskDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <span class="font-medium">${task.task_type.replace(/_/g, ' ').toUpperCase()}</span>
                        <p class="text-sm text-gray-600">${task.notes}</p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded ${task.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}">
                        ${task.status}
                    </span>
                </div>
            `;
            tasksList.appendChild(taskDiv);
        });
    }

    function showChecklistActions(status) {
        const allComplete = status.intake_forms_sent && status.intake_forms_completed && status.cc_on_file && status.first_appointment_scheduled;
        const actionsDiv = document.getElementById('checklistActions');
        actionsDiv.innerHTML = '';
        if (allComplete) {
            actionsDiv.innerHTML = `
                <button class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600" onclick="editChecklist()">Edit</button>
                <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onclick="startOverChecklist()">Start Over</button>
            `;
        }
    }

    window.editChecklist = function() {
        alert('Edit checklist feature coming soon!');
    };
    window.startOverChecklist = function() {
        if (confirm('Are you sure you want to start over? This will reset the checklist.')) {
            fetch(`/api/patients/${currentPatientId}/pre-visit-checklist/reset`, { method: 'POST' })
                .then(res => res.json())
                .then(() => loadPreVisitChecklist());
        }
    };

    window.triggerIntakeForms = async function() {
        try {
            const response = await fetch(`/api/patients/${currentPatientId}/trigger-automation`, {
                method: 'POST'
            });
            const result = await response.json();
            if (result.success) {
                alert('Intake forms sent successfully!');
                loadPreVisitChecklist();
            }
        } catch (error) {
            console.error('Error triggering intake forms:', error);
        }
    };

    window.markCCComplete = async function() {
        alert('Credit card collection feature would be implemented here');
    };

    window.scheduleAppointment = function() {
        window.location.href = `/calendar.html?patientId=${currentPatientId}`;
    };

    // Load patients on view load
    loadPatientsDropdown();
}