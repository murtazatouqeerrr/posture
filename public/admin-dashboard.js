document.addEventListener('DOMContentLoaded', function() {
    // Remove auth check for demo
    // checkAdminAccess();

    const userModal = document.getElementById('userModal');
    const addUserBtn = document.getElementById('addUserBtn');
    const closeModal = document.querySelector('.close');
    const userForm = document.getElementById('userForm');
    const usersTableBody = document.getElementById('usersTableBody');

    // Modal controls
    addUserBtn.onclick = () => openUserModal();
    closeModal.onclick = () => userModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === userModal) {
            userModal.style.display = 'none';
        }
    };

    // Form submission
    userForm.onsubmit = function(e) {
        e.preventDefault();
        saveUser();
    };

    // Load initial data
    loadUsers();
    loadAnalytics();

    function loadUsers() {
        fetch('/api/admin/users')
        .then(response => response.json())
        .then(users => {
            displayUsers(users);
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
    }

    function displayUsers(users) {
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            const createdDate = new Date(user.created_at).toLocaleDateString();
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.username}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.name}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">${user.role}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${createdDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button class="text-yellow-600 hover:text-yellow-900" onclick="editUser(${user.id})">Edit</button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    }

    function openUserModal(user = null) {
        const title = document.getElementById('userModalTitle');
        const passwordGroup = document.getElementById('passwordGroup');
        
        if (user) {
            title.textContent = 'Edit User';
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('name').value = user.name;
            document.getElementById('role').value = user.role;
            passwordGroup.style.display = 'none';
            document.getElementById('password').required = false;
        } else {
            title.textContent = 'Add New User';
            userForm.reset();
            document.getElementById('userId').value = '';
            passwordGroup.style.display = 'block';
            document.getElementById('password').required = true;
        }
        
        userModal.style.display = 'block';
    }

    function saveUser() {
        const userId = document.getElementById('userId').value;
        const userData = {
            username: document.getElementById('username').value,
            name: document.getElementById('name').value,
            role: document.getElementById('role').value
        };

        if (!userId) {
            userData.password = document.getElementById('password').value;
        }

        const url = userId ? `/api/admin/users/${userId}` : '/api/admin/users';
        const method = userId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            userModal.style.display = 'none';
            loadUsers();
        })
        .catch(error => {
            console.error('Error saving user:', error);
            alert('Error: Failed to save user');
        });
    }

    function loadAnalytics() {
        // Load overview metrics
        fetch('/api/admin/analytics/overview')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalPatients').textContent = data.total_patients;
            document.getElementById('totalAppointments').textContent = data.total_appointments;
            document.getElementById('totalRevenue').textContent = '$' + (data.total_revenue || 0);
            document.getElementById('conversionRate').textContent = data.conversion_rate + '%';
        });

        // Load appointment analytics
        fetch('/api/admin/analytics/appointments')
        .then(response => response.json())
        .then(data => {
            createAppointmentsByTypeChart(data.by_type);
            createAppointmentsByTherapistChart(data.by_therapist);
        });

        // Load patient analytics
        fetch('/api/admin/analytics/patients')
        .then(response => response.json())
        .then(data => {
            createNewPatientsChart(data.new_per_month);
            createComplaintsChart(data.common_complaints);
        });
    }

    function createAppointmentsByTypeChart(data) {
        const ctx = document.getElementById('appointmentsByTypeChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.type),
                datasets: [{
                    label: 'Appointments',
                    data: data.map(item => item.count),
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function createAppointmentsByTherapistChart(data) {
        const ctx = document.getElementById('appointmentsByTherapistChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    data: data.map(item => item.count),
                    backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    function createNewPatientsChart(data) {
        const ctx = document.getElementById('newPatientsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.month),
                datasets: [{
                    label: 'New Patients',
                    data: data.map(item => item.count),
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function createComplaintsChart(data) {
        const ctx = document.getElementById('complaintsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.primary_complaint),
                datasets: [{
                    label: 'Count',
                    data: data.map(item => item.count),
                    backgroundColor: '#e74c3c'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Global functions
    window.editUser = function(id) {
        fetch(`/api/admin/users`)
        .then(response => response.json())
        .then(users => {
            const user = users.find(u => u.id === id);
            if (user) {
                openUserModal(user);
            }
        });
    };

    window.deleteUser = function(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            fetch(`/api/admin/users/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                loadUsers();
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                alert('Error: Failed to delete user');
            });
        }
    };

    window.showTab = function(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('text-primary', 'border-b-2', 'border-primary', 'bg-white');
            btn.classList.add('text-gray-500', 'bg-gray-50');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName + '-tab');
        const selectedBtn = event.target;
        
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
        
        selectedBtn.classList.remove('text-gray-500', 'bg-gray-50');
        selectedBtn.classList.add('text-primary', 'border-b-2', 'border-primary', 'bg-white');
    };
});
