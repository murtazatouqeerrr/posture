document.addEventListener('DOMContentLoaded', function() {
    // Check admin access
    checkAdminAccess();

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

    function checkAdminAccess() {
        fetch('/api/check-auth', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated || data.user.role !== 'admin') {
                alert('Admin access required');
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Auth check failed:', error);
            window.location.href = 'login.html';
        });
    }

    function loadUsers() {
        fetch('/api/admin/users', {
            credentials: 'include'
        })
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
                <td>${user.username}</td>
                <td>${user.name}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td>${createdDate}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editUser(${user.id})">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteUser(${user.id})">Delete</button>
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
            credentials: 'include',
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            userModal.style.display = 'none';
            loadUsers();
        })
        .catch(error => {
            console.error('Error saving user:', error);
            alert('Error: ' + (error.error || 'Failed to save user'));
        });
    }

    function loadAnalytics() {
        // Load overview metrics
        fetch('/api/admin/analytics/overview', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalPatients').textContent = data.total_patients;
            document.getElementById('totalAppointments').textContent = data.total_appointments;
            document.getElementById('totalRevenue').textContent = '$' + (data.total_revenue || 0);
            document.getElementById('conversionRate').textContent = data.conversion_rate + '%';
        });

        // Load appointment analytics
        fetch('/api/admin/analytics/appointments', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            createAppointmentsByTypeChart(data.by_type);
            createAppointmentsByTherapistChart(data.by_therapist);
        });

        // Load patient analytics
        fetch('/api/admin/analytics/patients', {
            credentials: 'include'
        })
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
        fetch(`/api/admin/users`, {
            credentials: 'include'
        })
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
                method: 'DELETE',
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));
                }
                return response.json();
            })
            .then(data => {
                loadUsers();
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                alert('Error: ' + (error.error || 'Failed to delete user'));
            });
        }
    };

    window.showTab = function(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName + '-tab').classList.add('active');
        event.target.classList.add('active');
    };
});
