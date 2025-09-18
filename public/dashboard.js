// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    checkAuth();

    const addContactBtn = document.getElementById('addContactBtn');
    const addContactModal = document.getElementById('addContactModal');
    const editContactModal = document.getElementById('editContactModal');
    const closeModal = document.querySelector('.close');
    const closeEditModal = document.querySelector('.close-edit');
    const addContactForm = document.getElementById('addContactForm');
    const editContactForm = document.getElementById('editContactForm');
    const contactsTableBody = document.getElementById('contactsTableBody');
    const logoutBtn = document.getElementById('logoutBtn');

    // Logout functionality
    logoutBtn.onclick = logout;

    // Modal controls
    addContactBtn.onclick = () => addContactModal.style.display = 'block';
    closeModal.onclick = () => addContactModal.style.display = 'none';
    closeEditModal.onclick = () => editContactModal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === addContactModal) {
            addContactModal.style.display = 'none';
        }
        if (event.target === editContactModal) {
            editContactModal.style.display = 'none';
        }
    };

    // Form submissions
    addContactForm.onsubmit = function(e) {
        e.preventDefault();
        addContact();
    };

    editContactForm.onsubmit = function(e) {
        e.preventDefault();
        updateContact();
    };

    function checkAuth() {
        fetch('/api/check-auth', {
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Not authenticated');
            }
            return response.json();
        })
        .then(data => {
            if (data.authenticated) {
                document.getElementById('userName').textContent = data.user.name;
                
                // Show admin link if user is admin
                if (data.user.role === 'admin') {
                    const headerRight = document.querySelector('.header-right');
                    const adminLink = document.createElement('a');
                    adminLink.href = 'admin-dashboard.html';
                    adminLink.className = 'btn-primary';
                    adminLink.textContent = 'Admin';
                    headerRight.insertBefore(adminLink, headerRight.firstChild);
                }
                
                loadContacts();
            } else {
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Auth check failed:', error);
            window.location.href = 'login.html';
        });
    }

    function logout() {
        fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
            window.location.href = 'login.html';
        });
    }

    function showLoading() {
        contactsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';
    }

    function showError(message) {
        contactsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error: ${message}</td></tr>`;
    }

    function loadContacts() {
        showLoading();
        fetch('/api/contacts', {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(contacts => {
                displayContacts(contacts);
            })
            .catch(error => {
                console.error('Error loading contacts:', error);
                showError('Failed to load contacts. Please try again.');
            });
    }

    function displayContacts(contacts) {
        contactsTableBody.innerHTML = '';
        if (contacts.length === 0) {
            contactsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No contacts found.</td></tr>';
            return;
        }
        
        contacts.forEach(contact => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="patient-profile.html?id=${contact.id}" class="patient-link">${escapeHtml(contact.first_name)} ${escapeHtml(contact.last_name)}</a></td>
                <td>${escapeHtml(contact.email)}</td>
                <td>${escapeHtml(contact.phone) || 'N/A'}</td>
                <td>${escapeHtml(contact.status)}</td>
                <td>${escapeHtml(contact.primary_complaint) || 'N/A'}</td>
                <td>
                    <button class="action-btn btn-view" onclick="viewContact(${contact.id})">View</button>
                    <button class="action-btn btn-edit" onclick="editContact(${contact.id})">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteContact(${contact.id})">Delete</button>
                </td>
            `;
            contactsTableBody.appendChild(row);
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function addContact() {
        const email = document.getElementById('email').value;
        if (!validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        const contactData = {
            first_name: document.getElementById('firstName').value.trim(),
            last_name: document.getElementById('lastName').value.trim(),
            email: email.trim(),
            phone: document.getElementById('phone').value.trim(),
            primary_complaint: document.getElementById('primaryComplaint').value.trim()
        };

        const submitBtn = addContactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';

        fetch('/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(contactData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            addContactModal.style.display = 'none';
            addContactForm.reset();
            loadContacts();
        })
        .catch(error => {
            console.error('Error adding contact:', error);
            alert('Error: ' + (error.error || 'Failed to add contact'));
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Contact';
        });
    }

    function updateContact() {
        const email = document.getElementById('editEmail').value;
        if (!validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        const contactId = document.getElementById('editContactId').value;
        const contactData = {
            first_name: document.getElementById('editFirstName').value.trim(),
            last_name: document.getElementById('editLastName').value.trim(),
            email: email.trim(),
            phone: document.getElementById('editPhone').value.trim(),
            primary_complaint: document.getElementById('editPrimaryComplaint').value.trim(),
            status: document.getElementById('editStatus').value
        };

        const submitBtn = editContactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        fetch(`/api/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(contactData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            editContactModal.style.display = 'none';
            loadContacts();
        })
        .catch(error => {
            console.error('Error updating contact:', error);
            alert('Error: ' + (error.error || 'Failed to update contact'));
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Contact';
        });
    }

    // Global functions for action buttons
    window.viewContact = function(id) {
        fetch(`/api/contacts/${id}`, {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) throw new Error('Contact not found');
                return response.json();
            })
            .then(contact => {
                alert(`Contact Details:\nName: ${contact.first_name} ${contact.last_name}\nEmail: ${contact.email}\nPhone: ${contact.phone}\nStatus: ${contact.status}\nComplaint: ${contact.primary_complaint}`);
            })
            .catch(error => {
                alert('Error loading contact details');
            });
    };

    window.editContact = function(id) {
        fetch(`/api/contacts/${id}`, {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) throw new Error('Contact not found');
                return response.json();
            })
            .then(contact => {
                document.getElementById('editContactId').value = contact.id;
                document.getElementById('editFirstName').value = contact.first_name;
                document.getElementById('editLastName').value = contact.last_name;
                document.getElementById('editEmail').value = contact.email;
                document.getElementById('editPhone').value = contact.phone || '';
                document.getElementById('editPrimaryComplaint').value = contact.primary_complaint || '';
                document.getElementById('editStatus').value = contact.status;
                editContactModal.style.display = 'block';
            })
            .catch(error => {
                alert('Error loading contact for editing');
            });
    };

    window.deleteContact = function(id) {
        if (confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
            fetch(`/api/contacts/${id}`, {
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
                loadContacts();
            })
            .catch(error => {
                console.error('Error deleting contact:', error);
                alert('Error: ' + (error.error || 'Failed to delete contact'));
            });
        }
    };
});
