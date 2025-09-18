// Calendar JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    const addAppointmentModal = document.getElementById('addAppointmentModal');
    const closeModal = document.querySelector('.close');
    const addAppointmentForm = document.getElementById('addAppointmentForm');
    const appointmentsTableBody = document.getElementById('appointmentsTableBody');
    const contactSelect = document.getElementById('contactSelect');

    // Load data on page load
    loadContacts();
    loadAppointments();

    // Modal controls
    addAppointmentBtn.onclick = () => addAppointmentModal.style.display = 'block';
    closeModal.onclick = () => addAppointmentModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === addAppointmentModal) {
            addAppointmentModal.style.display = 'none';
        }
    };

    // Form submission
    addAppointmentForm.onsubmit = function(e) {
        e.preventDefault();
        addAppointment();
    };

    function loadContacts() {
        fetch('/api/contacts')
            .then(response => response.json())
            .then(contacts => {
                contactSelect.innerHTML = '<option value="">Select Contact</option>';
                contacts.forEach(contact => {
                    const option = document.createElement('option');
                    option.value = contact.id;
                    option.textContent = `${contact.first_name} ${contact.last_name}`;
                    contactSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading contacts:', error);
            });
    }

    function loadAppointments() {
        fetch('/api/appointments')
            .then(response => response.json())
            .then(appointments => {
                displayAppointments(appointments);
            })
            .catch(error => {
                console.error('Error loading appointments:', error);
            });
    }

    function displayAppointments(appointments) {
        appointmentsTableBody.innerHTML = '';
        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            const dateTime = new Date(appointment.date_time).toLocaleString();
            const contactName = appointment.first_name && appointment.last_name 
                ? `${appointment.first_name} ${appointment.last_name}` 
                : 'N/A';
            
            row.innerHTML = `
                <td>${dateTime}</td>
                <td>${contactName}</td>
                <td>${appointment.type}</td>
                <td>${appointment.status}</td>
                <td>${appointment.notes || 'N/A'}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="updateAppointmentStatus(${appointment.id}, 'Completed')">Complete</button>
                    <button class="action-btn btn-delete" onclick="deleteAppointment(${appointment.id})">Delete</button>
                </td>
            `;
            appointmentsTableBody.appendChild(row);
        });
    }

    function addAppointment() {
        const appointmentData = {
            contact_id: document.getElementById('contactSelect').value,
            date_time: document.getElementById('dateTime').value,
            type: document.getElementById('appointmentType').value,
            notes: document.getElementById('appointmentNotes').value
        };

        fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                addAppointmentModal.style.display = 'none';
                addAppointmentForm.reset();
                loadAppointments();
            }
        })
        .catch(error => {
            console.error('Error adding appointment:', error);
        });
    }

    // Global functions
    window.updateAppointmentStatus = function(id, status) {
        fetch(`/api/appointments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: status })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                loadAppointments();
            }
        });
    };

    window.deleteAppointment = function(id) {
        if (confirm('Are you sure you want to delete this appointment?')) {
            fetch(`/api/appointments/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Error: ' + data.error);
                } else {
                    loadAppointments();
                }
            });
        }
    };
});
