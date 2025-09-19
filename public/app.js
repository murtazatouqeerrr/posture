// Modern SPA Application with Tailwind CSS
class CRMApp {
    constructor() {
        this.currentUser = null;
        this.currentRoute = '';
        this.init();
    }

    init() {
        this.checkAuth();
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('popstate', () => this.handleRoute());
        this.setupNavigation();
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.onclick = () => {
                sidebar.classList.toggle('-translate-x-full');
            };
        }
    }

    async checkAuth() {
        // TEMPORARY - Skip auth for now
        this.currentUser = { name: 'Demo User', role: 'admin' };
        this.showApp();
        this.handleRoute();
    }

    showApp() {
        document.getElementById('sidebar').style.display = 'block';
        document.getElementById('topHeader').style.display = 'block';
        
        const headerUserName = document.getElementById('headerUserName');
        const headerUserRole = document.getElementById('headerUserRole');
        const headerUserInitial = document.getElementById('headerUserInitial');
        const adminLinks = document.querySelectorAll('.admin-only');
        
        headerUserName.textContent = this.currentUser.name;
        headerUserRole.textContent = this.currentUser.role;
        headerUserInitial.textContent = this.currentUser.name.charAt(0).toUpperCase();
        
        adminLinks.forEach(link => {
            link.style.display = this.currentUser.role === 'admin' ? 'flex' : 'none';
        });
    }

    hideApp() {
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('topHeader').style.display = 'none';
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-item') || e.target.closest('.nav-item')) {
                e.preventDefault();
                const navItem = e.target.classList.contains('nav-item') ? e.target : e.target.closest('.nav-item');
                const href = navItem.getAttribute('href');
                window.location.hash = href;
                this.updateActiveNavLink(navItem);
            }
        });

        document.getElementById('headerLogoutBtn').onclick = () => this.logout();
    }

    updateActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-item').forEach(link => {
            link.classList.remove('active', 'bg-primary', 'text-white');
            link.classList.add('text-gray-700');
        });
        activeLink.classList.add('active', 'bg-primary', 'text-white');
        activeLink.classList.remove('text-gray-700');
    }

    updatePageTitle(title) {
        document.getElementById('pageTitle').textContent = title;
    }

    handleRoute() {
        const hash = window.location.hash || '#/dashboard';
        const [route, param] = hash.substring(2).split('/');
        
        this.currentRoute = route;
        
        switch (route) {
            case 'dashboard':
                this.updatePageTitle('Dashboard');
                this.loadDashboardView();
                break;
            case 'patient':
                this.updatePageTitle('Patient Profile');
                this.loadPatientProfileView(param);
                break;
            case 'calendar':
                this.updatePageTitle('Calendar');
                this.loadCalendarView();
                break;
            case 'invoices':
                this.updatePageTitle('Invoices');
                this.loadInvoicesView();
                break;
            case 'reports':
                this.updatePageTitle('Reports');
                this.loadReportsView();
                break;
            case 'templates':
                this.updatePageTitle('Templates');
                this.loadTemplatesView();
                break;
            case 'admin':
                this.updatePageTitle('Admin Dashboard');
                this.loadAdminView();
                break;
            default:
                this.updatePageTitle('Dashboard');
                this.loadDashboardView();
        }
    }

    async logout() {
        window.location.reload();
    }

    async loadDashboardView() {
        const html = `
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-lg shadow border">
                    <div class="flex items-center">
                        <svg class="h-8 w-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                        <div>
                            <p class="text-sm text-gray-600">Total Patients</p>
                            <p class="text-2xl font-bold text-gray-900" id="totalPatientsCount">-</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg shadow border">
                    <div class="flex items-center">
                        <svg class="h-8 w-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z"></path>
                        </svg>
                        <div>
                            <p class="text-sm text-gray-600">Appointments</p>
                            <p class="text-2xl font-bold text-gray-900" id="totalAppointmentsCount">-</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg shadow border">
                    <div class="flex items-center">
                        <svg class="h-8 w-8 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <div>
                            <p class="text-sm text-gray-600">Invoices</p>
                            <p class="text-2xl font-bold text-gray-900" id="totalInvoicesCount">-</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg shadow border">
                    <div class="flex items-center">
                        <svg class="h-8 w-8 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                        <div>
                            <p class="text-sm text-gray-600">Revenue</p>
                            <p class="text-2xl font-bold text-gray-900" id="totalRevenueCount">-</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow border">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Patients</h3>
                        <p class="text-sm text-gray-600">Manage your patient database</p>
                    </div>
                    <button id="addContactBtn" class="bg-primary hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Patient
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="contactsTableBody" class="divide-y divide-gray-200">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Add Contact Modal -->
        <div id="addContactModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" style="display: none;">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Add New Patient</h3>
                        <button class="close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    
                    <form id="addContactForm" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" id="firstName" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" id="lastName" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" id="phone" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Primary Complaint</label>
                            <textarea id="primaryComplaint" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                                <option value="Lead">Lead</option>
                                <option value="Client">Client</option>
                                <option value="Past Client">Past Client</option>
                            </select>
                        </div>
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" class="close px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-teal-700 rounded-md">Add Patient</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Edit Contact Modal -->
        <div id="editContactModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" style="display: none;">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Edit Patient</h3>
                        <button class="close-edit text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    
                    <form id="editContactForm" class="space-y-4">
                        <input type="hidden" id="editContactId">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" id="editFirstName" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" id="editLastName" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="editEmail" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" id="editPhone" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Primary Complaint</label>
                            <textarea id="editPrimaryComplaint" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Status</label>
                            <select id="editStatus" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                                <option value="Lead">Lead</option>
                                <option value="Client">Client</option>
                                <option value="Past Client">Past Client</option>
                            </select>
                        </div>
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" class="close-edit px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-teal-700 rounded-md">Update Patient</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        this.setupDashboardEvents();
        this.loadContacts();
        this.loadDashboardStats();
    }

    setupDashboardEvents() {
        const addContactBtn = document.getElementById('addContactBtn');
        const addContactModal = document.getElementById('addContactModal');
        const editContactModal = document.getElementById('editContactModal');
        const closeModal = document.querySelector('.close');
        const closeEditModal = document.querySelector('.close-edit');

        addContactBtn.onclick = () => addContactModal.style.display = 'block';
        closeModal.onclick = () => addContactModal.style.display = 'none';
        closeEditModal.onclick = () => editContactModal.style.display = 'none';

        document.getElementById('addContactForm').onsubmit = (e) => {
            e.preventDefault();
            this.addContact();
        };

        document.getElementById('editContactForm').onsubmit = (e) => {
            e.preventDefault();
            this.updateContact();
        };

        window.onclick = (event) => {
            if (event.target === addContactModal) addContactModal.style.display = 'none';
            if (event.target === editContactModal) editContactModal.style.display = 'none';
        };
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('/api/admin/analytics/overview');
            const data = await response.json();
            document.getElementById('totalPatientsCount').textContent = data.total_patients;
            document.getElementById('totalAppointmentsCount').textContent = data.total_appointments;
            document.getElementById('totalInvoicesCount').textContent = data.total_appointments;
            document.getElementById('totalRevenueCount').textContent = '$' + (data.total_revenue || 0);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadContacts() {
        try {
            const response = await fetch('/api/contacts');
            const contacts = await response.json();
            this.displayContacts(contacts);
        } catch (error) {
            console.error('Error loading contacts:', error);
            document.getElementById('contactsTableBody').innerHTML = 
                '<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error loading contacts</td></tr>';
        }
    }

    displayContacts(contacts) {
        const tbody = document.getElementById('contactsTableBody');
        
        if (contacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No contacts found.</td></tr>';
            return;
        }
        
        tbody.innerHTML = contacts.map(contact => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <a href="#/patient/${contact.id}" class="text-primary hover:text-teal-700 font-medium">${this.escapeHtml(contact.first_name)} ${this.escapeHtml(contact.last_name)}</a>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.escapeHtml(contact.email)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.escapeHtml(contact.phone) || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusColor(contact.status)}">
                        ${this.escapeHtml(contact.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.escapeHtml(contact.primary_complaint) || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onclick="app.viewContact(${contact.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700">
                        View
                    </button>
                    <button onclick="app.editContact(${contact.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700">
                        Edit
                    </button>
                    <button onclick="app.deleteContact(${contact.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async addContact() {
        const contactData = {
            first_name: document.getElementById('firstName').value.trim(),
            last_name: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            primary_complaint: document.getElementById('primaryComplaint').value.trim(),
            status: document.getElementById('status').value
        };

        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            if (response.ok) {
                document.getElementById('addContactModal').style.display = 'none';
                document.getElementById('addContactForm').reset();
                alert('Patient added successfully!');
                this.loadContacts();
                this.loadDashboardStats();
            } else {
                const error = await response.json();
                alert('Error: ' + error.error);
            }
        } catch (error) {
            console.error('Error adding contact:', error);
            alert('Failed to add patient');
        }
    }

    async viewContact(id) {
        try {
            const response = await fetch(`/api/contacts/${id}`);
            const contact = await response.json();
            alert(`Patient Details:\nName: ${contact.first_name} ${contact.last_name}\nEmail: ${contact.email}\nPhone: ${contact.phone}\nStatus: ${contact.status}\nComplaint: ${contact.primary_complaint}`);
        } catch (error) {
            alert('Error loading patient details');
        }
    }

    async editContact(id) {
        try {
            const response = await fetch(`/api/contacts/${id}`);
            const contact = await response.json();
            
            document.getElementById('editContactId').value = contact.id;
            document.getElementById('editFirstName').value = contact.first_name;
            document.getElementById('editLastName').value = contact.last_name;
            document.getElementById('editEmail').value = contact.email;
            document.getElementById('editPhone').value = contact.phone || '';
            document.getElementById('editPrimaryComplaint').value = contact.primary_complaint || '';
            document.getElementById('editStatus').value = contact.status;
            
            document.getElementById('editContactModal').style.display = 'block';
        } catch (error) {
            alert('Error loading patient for editing');
        }
    }

    async updateContact() {
        const contactId = document.getElementById('editContactId').value;
        const contactData = {
            first_name: document.getElementById('editFirstName').value.trim(),
            last_name: document.getElementById('editLastName').value.trim(),
            email: document.getElementById('editEmail').value.trim(),
            phone: document.getElementById('editPhone').value.trim(),
            primary_complaint: document.getElementById('editPrimaryComplaint').value.trim(),
            status: document.getElementById('editStatus').value
        };

        try {
            const response = await fetch(`/api/contacts/${contactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            if (response.ok) {
                document.getElementById('editContactModal').style.display = 'none';
                alert('Patient updated successfully!');
                this.loadContacts();
            } else {
                const error = await response.json();
                alert('Error: ' + error.error);
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            alert('Failed to update patient');
        }
    }

    async deleteContact(id) {
        if (confirm('Are you sure you want to delete this patient?')) {
            try {
                const response = await fetch(`/api/contacts/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('Patient deleted successfully!');
                    this.loadContacts();
                    this.loadDashboardStats();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            } catch (error) {
                console.error('Error deleting contact:', error);
                alert('Failed to delete patient');
            }
        }
    }

    getStatusColor(status) {
        switch(status) {
            case 'Client': return 'bg-green-100 text-green-800';
            case 'Lead': return 'bg-yellow-100 text-yellow-800';
            case 'Past Client': return 'bg-gray-100 text-gray-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    }

    loadPatientProfileView(patientId) {
        window.location.href = `patient-profile.html?id=${patientId}`;
    }

    loadCalendarView() {
        window.location.href = 'calendar.html';
    }

    loadInvoicesView() {
        window.location.href = 'invoices.html';
    }

    loadReportsView() {
        window.location.href = 'reports.html';
    }

    loadTemplatesView() {
        window.location.href = 'templates.html';
    }

    async loadAdminView() {
        window.location.href = 'admin-dashboard.html';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for backward compatibility
window.showLogin = () => {};
window.showSignup = () => {};

// Initialize the app
const app = new CRMApp();
