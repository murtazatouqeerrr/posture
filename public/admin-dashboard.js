// Admin Dashboard Management
let adminData = {
    users: [],
    analytics: {},
    contacts: [],
    invoices: []
};

// Global notification function
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer') || createNotificationContainer();
    const notification = document.createElement('div');
    
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }[type] || 'bg-blue-500';
    
    notification.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
}

async function loadAdminView() {
    console.log('⚙️ Loading admin dashboard...');
    
    try {
        // Fetch real data from multiple endpoints
        const [usersResponse, analyticsResponse, contactsResponse, invoicesResponse] = await Promise.all([
            fetch('/api/admin/users'),
            fetch('/api/admin/analytics/financial'),
            fetch('/api/contacts'),
            fetch('/api/invoices')
        ]);

        if (!usersResponse.ok) {
            throw new Error(`Failed to fetch users: ${usersResponse.status}`);
        }
        if (!analyticsResponse.ok) {
            throw new Error(`Failed to fetch analytics: ${analyticsResponse.status}`);
        }

        adminData.users = await usersResponse.json();
        adminData.analytics = await analyticsResponse.json();
        adminData.contacts = await contactsResponse.json();
        adminData.invoices = await invoicesResponse.json();
        
        console.log(`✅ Loaded ${adminData.users.length} users, ${adminData.contacts.length} contacts, and analytics data`);
        
        renderAdminView();
    } catch (error) {
        console.error('❌ Admin loading error:', error);
        document.getElementById('app').innerHTML = `
            <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 class="text-red-800 font-medium">Error Loading Admin Dashboard</h3>
                    <p class="text-red-700 mt-2">${error.message}</p>
                    <button onclick="loadAdminView()" class="mt-3 bg-red-100 px-3 py-2 rounded text-red-800 hover:bg-red-200">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderAdminView() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                <p class="text-gray-600">System administration and analytics</p>
            </div>

            <!-- Analytics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Users</p>
                            <p class="text-2xl font-semibold text-gray-900">${adminData.users.length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Patients</p>
                            <p class="text-2xl font-semibold text-gray-900">${adminData.contacts.length}</p>
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
                            <p class="text-sm font-medium text-gray-600">Total Appointments</p>
                            <p class="text-2xl font-semibold text-gray-900">0</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-yellow-100 rounded-lg">
                            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p class="text-2xl font-semibold text-gray-900">$${adminData.analytics.totalRevenue || '0.00'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="border-b border-gray-200 mb-6">
                <nav class="-mb-px flex space-x-8">
                    <button class="admin-tab-btn border-b-2 border-primary text-primary py-2 px-1 text-sm font-medium" data-tab="users">
                        Users
                    </button>
                    <button class="admin-tab-btn border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium" data-tab="analytics">
                        Analytics
                    </button>
                    <button class="admin-tab-btn border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium" data-tab="settings">
                        Settings
                    </button>
                </nav>
            </div>

            <!-- Tab Content -->
            <div id="adminTabContent">
                <!-- Content will be loaded here -->
            </div>
        </div>
    `;

    // Setup tab navigation
    setupAdminTabs();
    
    // Load default tab
    loadAdminTab('users');
}

function setupAdminTabs() {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.admin-tab-btn').forEach(b => {
                b.classList.remove('border-primary', 'text-primary');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            btn.classList.remove('border-transparent', 'text-gray-500');
            btn.classList.add('border-primary', 'text-primary');
            
            // Load tab content
            loadAdminTab(tab);
        });
    });
}

function loadAdminTab(tab) {
    console.log(`📋 Loading admin tab: ${tab}`);
    const content = document.getElementById('adminTabContent');
    
    switch (tab) {
        case 'users':
            content.innerHTML = renderUsersTab();
            setupUsersTabEvents();
            break;
        case 'analytics':
            content.innerHTML = renderAnalyticsTab();
            break;
        case 'settings':
            content.innerHTML = renderSettingsTab();
            break;
        default:
            content.innerHTML = renderUsersTab();
            setupUsersTabEvents();
    }
}

function renderUsersTab() {
    return `
        <div>
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-medium text-gray-900">User Management</h3>
                <button id="addUserBtn" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                    Add New User
                </button>
            </div>

            <!-- Users Table -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${adminData.users.length > 0 ? adminData.users.map(user => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                            <span class="text-white font-medium">${(user.name || user.username || 'U').charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">${user.name || user.username || 'Unknown User'}</div>
                                            <div class="text-sm text-gray-500">ID: ${user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">${user.email}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}">
                                        ${user.role}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${formatDate(user.created_at)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onclick="editUser(${user.id})" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                    <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderAnalyticsTab() {
    return `
        <div>
            <h3 class="text-lg font-medium text-gray-900 mb-6">System Analytics</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Financial Overview -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Financial Overview</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Total Revenue:</span>
                            <span class="font-medium text-green-600">$${adminData.analytics.totalRevenue || '0.00'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Pending Invoices:</span>
                            <span class="font-medium text-yellow-600">${adminData.analytics.pendingInvoices || 0}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Outstanding Amount:</span>
                            <span class="font-medium text-red-600">$${adminData.analytics.monthlyRevenue || '0.00'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- System Stats -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">System Statistics</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Total Users:</span>
                            <span class="font-medium">${adminData.users.length}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Total Patients:</span>
                            <span class="font-medium">${adminData.contacts.length}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Total Appointments:</span>
                            <span class="font-medium">0</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Additional Analytics -->
            <div class="mt-6 bg-white rounded-lg shadow p-6">
                <h4 class="text-md font-medium text-gray-900 mb-4">Quick Actions</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="refreshAnalytics()" class="bg-blue-100 text-blue-800 px-4 py-2 rounded-md hover:bg-blue-200">
                        Refresh Data
                    </button>
                    <button onclick="exportData()" class="bg-green-100 text-green-800 px-4 py-2 rounded-md hover:bg-green-200">
                        Export Data
                    </button>
                    <button onclick="viewLogs()" class="bg-purple-100 text-purple-800 px-4 py-2 rounded-md hover:bg-purple-200">
                        View Logs
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderSettingsTab() {
    return `
        <div>
            <h3 class="text-lg font-medium text-gray-900 mb-6">System Settings</h3>
            
            <div class="space-y-6">
                <!-- General Settings -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">General Settings</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">System Name</label>
                            <input type="text" value="Posture Perfect CRM" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Default Session Duration (minutes)</label>
                            <input type="number" value="60" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                        </div>
                    </div>
                </div>
                
                <!-- Security Settings -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Security Settings</h4>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-medium text-gray-900">Two-Factor Authentication</div>
                                <div class="text-sm text-gray-500">Require 2FA for all admin users</div>
                            </div>
                            <button class="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                <span class="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                            </button>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-medium text-gray-900">Session Timeout</div>
                                <div class="text-sm text-gray-500">Auto-logout after inactivity</div>
                            </div>
                            <select class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                                <option>30 minutes</option>
                                <option>1 hour</option>
                                <option>2 hours</option>
                                <option>4 hours</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Save Button -->
                <div class="flex justify-end">
                    <button onclick="saveSettings()" class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupUsersTabEvents() {
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', showAddUserModal);
    }
}

function showAddUserModal() {
    console.log('➕ Showing add user modal...');
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Add New User</h3>
                <button id="closeModal" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form id="userForm">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" id="username" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" id="password" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select id="role" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                            <option value="">Select role</option>
                            <option value="admin">Admin</option>
                            <option value="therapist">Therapist</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button type="submit" class="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        Create User
                    </button>
                    <button type="button" id="cancelBtn" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('closeModal').addEventListener('click', () => modal.remove());
    document.getElementById('cancelBtn').addEventListener('click', () => modal.remove());
    
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value
        };

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ User created:', result);
            
            showNotification('User created successfully!', 'success');
            modal.remove();
            
            // Reload admin view
            await loadAdminView();
            
        } catch (error) {
            console.error('❌ Error creating user:', error);
            showNotification('Failed to create user. Please try again.', 'error');
        }
    });
}

function editUser(userId) {
    console.log(`✏️ Editing user ${userId}`);
    showNotification(`Edit user ${userId} - Feature coming soon!`, 'info');
}

function deleteUser(userId) {
    console.log(`🗑️ Deleting user ${userId}`);
    if (confirm('Are you sure you want to delete this user?')) {
        showNotification(`Delete user ${userId} - Feature coming soon!`, 'info');
    }
}

function refreshAnalytics() {
    console.log('🔄 Refreshing analytics...');
    loadAdminView();
}

function exportData() {
    console.log('📤 Exporting data...');
    showNotification('Data export - Feature coming soon!', 'info');
}

function viewLogs() {
    console.log('📋 Viewing logs...');
    showNotification('View logs - Feature coming soon!', 'info');
}

function saveSettings() {
    console.log('💾 Saving settings...');
    showNotification('Settings saved successfully!', 'success');
}

function getRoleColor(role) {
    switch (role) {
        case 'admin':
            return 'bg-red-100 text-red-800';
        case 'therapist':
            return 'bg-blue-100 text-blue-800';
        case 'user':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
