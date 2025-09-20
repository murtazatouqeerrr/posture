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
        
        document.getElementById('main-content').innerHTML = mainContent.innerHTML;
        
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
        document.getElementById('main-content').innerHTML = `
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
        const response = await fetch('/api/nudge/history');
        const emails = await response.json();
        
        const logDiv = document.getElementById('automationLog');
        if (emails.length === 0) {
            logDiv.innerHTML = '<div class="text-sm text-gray-500">No automation activity yet</div>';
            return;
        }
        
        logDiv.innerHTML = emails.slice(0, 10).map(email => `
            <div class="flex justify-between items-center p-2 bg-white rounded border">
                <div>
                    <span class="font-medium">${email.email_type.replace(/_/g, ' ').toUpperCase()}</span>
                    <span class="text-gray-500 text-sm">- Patient ID: ${email.patient_id}</span>
                </div>
                <span class="text-xs text-gray-400">${new Date(email.sent_at).toLocaleString()}</span>
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
    document.getElementById('app').innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">🔄 Subscriptions</h2>
                <p class="text-gray-600">Manage recurring billing and subscriptions</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <p class="text-gray-500">Subscription management coming soon...</p>
            </div>
        </div>
    `;
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
        
        const response = await fetch('/api/packages');
        if (!response.ok) {
            throw new Error(`Failed to load packages: ${response.status}`);
        }
        let packages = await response.json();
        
        // Add fallback data if empty or undefined
        if (!packages || packages.length === 0) {
            packages = [
                {
                    id: 1,
                    name: 'Starter Package',
                    description: 'Perfect for beginners - includes 4 treatment sessions',
                    number_of_sessions: 4,
                    price: 299.99
                },
                {
                    id: 2,
                    name: 'Standard Package', 
                    description: 'Most popular choice - 8 comprehensive sessions',
                    number_of_sessions: 8,
                    price: 549.99
                },
                {
                    id: 3,
                    name: 'Premium Package',
                    description: 'Complete treatment plan with 12 sessions',
                    number_of_sessions: 12,
                    price: 799.99
                }
            ];
        }
        
        mainContent.innerHTML = `
            <div class="packages-management">
                <div class="header-section mb-6">
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Package Management</h1>
                    <p class="text-gray-600">Manage treatment packages and subscriptions</p>
                </div>
                
                <div class="packages-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${packages.map(pkg => `
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
                            <button onclick="subscribeToPackage(${pkg.id || 1})" 
                                    class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                                Subscribe Now
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
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
    try {
        console.log('📋 Loading pre-visit checklist view...');
        
        const mainContent = document.getElementById('app');
        if (!mainContent) {
            console.error('❌ No app element found');
            return;
        }
        
        mainContent.innerHTML = `
            <div class="pre-visit-checklist">
                <div class="header-section mb-6">
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Pre-Visit Checklist</h1>
                    <p class="text-gray-600">Complete this checklist before your appointment</p>
                </div>
                
                <div class="checklist-form bg-white rounded-lg shadow-md p-6">
                    <form id="pre-visit-form">
                        <div class="section mb-6">
                            <h3 class="text-lg font-semibold mb-4 text-blue-800">Personal Information</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" id="patient-name" placeholder="Full Name" value="John Smith" class="border rounded px-3 py-2" required>
                                <input type="email" id="patient-email" placeholder="Email Address" value="john.smith@email.com" class="border rounded px-3 py-2" required>
                                <input type="tel" id="patient-phone" placeholder="Phone Number" value="555-0123" class="border rounded px-3 py-2" required>
                                <input type="date" id="appointment-date" value="2024-09-25" class="border rounded px-3 py-2" required>
                            </div>
                        </div>
                        
                        <div class="section mb-6">
                            <h3 class="text-lg font-semibold mb-4 text-blue-800">Current Symptoms</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Pain Level (1-10)</label>
                                    <input type="range" id="pain-level" min="1" max="10" value="6" 
                                           class="w-full" oninput="document.getElementById('pain-value').textContent = this.value">
                                    <div class="text-center mt-1">Current: <span id="pain-value">6</span></div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Primary Complaint</label>
                                    <select id="primary-complaint" class="w-full border rounded px-3 py-2">
                                        <option value="">Select complaint</option>
                                        <option value="back-pain" selected>Back Pain</option>
                                        <option value="neck-pain">Neck Pain</option>
                                        <option value="shoulder-pain">Shoulder Pain</option>
                                        <option value="knee-pain">Knee Pain</option>
                                        <option value="hip-pain">Hip Pain</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto">
                                Submit Pre-Visit Form
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Add form handler
        setTimeout(() => {
            const form = document.getElementById('pre-visit-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    alert('Pre-visit form submitted successfully!');
                });
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ Pre-visit loading error:', error);
        const mainContent = document.getElementById('app');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Pre-Visit Checklist</h2>
                    <p>Unable to load pre-visit form: ${error.message}</p>
                </div>
            `;
        }
    }
}
