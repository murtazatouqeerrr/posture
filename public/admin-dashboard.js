class AdminDashboard {
    constructor() {
        this.users = [];
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadUsers();
        await this.loadAnalytics();
        this.setupEventListeners();
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            this.users = await response.json();
            this.displayUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showErrorMessage('Failed to load users');
        }
    }

    async loadAnalytics() {
        try {
            const response = await fetch('/api/admin/analytics/overview');
            const data = await response.json();
            
            document.getElementById('totalUsers').textContent = data.total_users || 0;
            document.getElementById('totalPatients').textContent = data.total_patients || 0;
            document.getElementById('totalAppointments').textContent = data.total_appointments || 0;
            document.getElementById('totalRevenue').textContent = '$' + (data.total_revenue || 0);
            
            await this.loadCharts();
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    async loadCharts() {
        try {
            const [leadsRes, revenueRes] = await Promise.all([
                fetch('/api/reports/leads-per-month'),
                fetch('/api/reports/revenue-per-month')
            ]);
            
            const leadsData = await leadsRes.json();
            const revenueData = await revenueRes.json();
            
            this.renderLeadsChart(leadsData);
            this.renderRevenueChart(revenueData);
        } catch (error) {
            console.error('Error loading charts:', error);
        }
    }

    renderLeadsChart(data) {
        const ctx = document.getElementById('adminLeadsChart').getContext('2d');
        
        if (this.charts.leads) {
            this.charts.leads.destroy();
        }
        
        this.charts.leads = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'New Patients',
                    data: data.map(d => d.count),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Patient Growth'
                    }
                }
            }
        });
    }

    renderRevenueChart(data) {
        const ctx = document.getElementById('adminRevenueChart').getContext('2d');
        
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }
        
        this.charts.revenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Revenue ($)',
                    data: data.map(d => d.revenue),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Revenue'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        document.getElementById('addUserBtn').onclick = () => this.showAddUserModal();
        document.querySelector('.close-user').onclick = () => this.hideUserModal();
        document.querySelector('.close-edit-user').onclick = () => this.hideEditUserModal();
        
        document.getElementById('userForm').onsubmit = (e) => {
            e.preventDefault();
            this.addUser();
        };
        
        document.getElementById('editUserForm').onsubmit = (e) => {
            e.preventDefault();
            this.updateUser();
        };
    }

    showAddUserModal() {
        document.getElementById('userModal').style.display = 'block';
    }

    hideUserModal() {
        document.getElementById('userModal').style.display = 'none';
        document.getElementById('userForm').reset();
    }

    hideEditUserModal() {
        document.getElementById('editUserModal').style.display = 'none';
    }

    async addUser() {
        const formData = new FormData(document.getElementById('userForm'));
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role')
        };

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                this.hideUserModal();
                await this.loadUsers();
                this.showSuccessMessage('User created successfully!');
            } else {
                const error = await response.json();
                this.showErrorMessage('Error: ' + error.error);
            }
        } catch (error) {
            this.showErrorMessage('Failed to create user');
        }
    }

    async editUser(id) {
        try {
            const response = await fetch(`/api/admin/users/${id}`);
            const user = await response.json();
            
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editRole').value = user.role;
            
            document.getElementById('editUserModal').style.display = 'block';
        } catch (error) {
            this.showErrorMessage('Error loading user');
        }
    }

    async updateUser() {
        const userId = document.getElementById('editUserId').value;
        const formData = new FormData(document.getElementById('editUserForm'));
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            role: formData.get('role')
        };

        const password = formData.get('password');
        if (password) {
            userData.password = password;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                this.hideEditUserModal();
                await this.loadUsers();
                this.showSuccessMessage('User updated successfully!');
            } else {
                const error = await response.json();
                this.showErrorMessage('Error: ' + error.error);
            }
        } catch (error) {
            this.showErrorMessage('Failed to update user');
        }
    }

    async deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`/api/admin/users/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadUsers();
                    this.showSuccessMessage('User deleted successfully!');
                } else {
                    const error = await response.json();
                    this.showErrorMessage('Error: ' + error.error);
                }
            } catch (error) {
                this.showErrorMessage('Failed to delete user');
            }
        }
    }

    displayUsers() {
        const tbody = document.getElementById('usersTableBody');
        
        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No users found.</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.users.map(user => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${this.escapeHtml(user.username)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.escapeHtml(user.email)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getRoleColor(user.role)}">
                        ${user.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.created_at || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onclick="adminDashboard.editUser(${user.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700">
                        Edit
                    </button>
                    <button onclick="adminDashboard.deleteUser(${user.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getRoleColor(role) {
        switch(role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'therapist': return 'bg-blue-100 text-blue-800';
            case 'staff': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const adminDashboard = new AdminDashboard();
