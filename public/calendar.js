document.addEventListener('DOMContentLoaded', function() {
    loadAppointments();
    setupEventHandlers();
});

function setupEventHandlers() {
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    const addAppointmentModal = document.getElementById('addAppointmentModal');
    const closeModal = document.querySelector('.close');
    const addAppointmentForm = document.getElementById('addAppointmentForm');

    if (addAppointmentBtn) {
        addAppointmentBtn.onclick = () => addAppointmentModal.style.display = 'block';
    }
    
    if (closeModal) {
        closeModal.onclick = () => addAppointmentModal.style.display = 'none';
    }

    if (addAppointmentForm) {
        addAppointmentForm.onsubmit = function(e) {
            e.preventDefault();
            addAppointment();
        };
    }

    window.onclick = (event) => {
        if (event.target === addAppointmentModal) {
            addAppointmentModal.style.display = 'none';
        }
    };
}

async function loadAppointments() {
    try {
        const response = await fetch('/api/appointments');
        const appointments = await response.json();
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        document.getElementById('appointmentsTableBody').innerHTML = 
            '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading appointments</td></tr>';
    }
}

function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No appointments found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = appointments.map(appointment => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${appointment.patient_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(appointment.date_time).toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${appointment.type}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}">
                    ${appointment.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="viewAppointment(${appointment.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700">View</button>
                <button onclick="editAppointment(${appointment.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700">Edit</button>
                <button onclick="deleteAppointment(${appointment.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700">Delete</button>
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    switch(status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Scheduled': return 'bg-blue-100 text-blue-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

async function addAppointment() {
    const appointmentData = {
        contact_id: document.getElementById('appointmentContact').value,
        date_time: document.getElementById('appointmentDateTime').value,
        type: document.getElementById('appointmentType').value,
        notes: document.getElementById('appointmentNotes').value
    };

    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });

        if (response.ok) {
            document.getElementById('addAppointmentModal').style.display = 'none';
            document.getElementById('addAppointmentForm').reset();
            loadAppointments();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding appointment:', error);
        alert('Failed to add appointment');
    }
}

function viewAppointment(id) {
    // Show appointment details in modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 class="text-lg font-medium mb-4">Appointment Details</h3>
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Status:</strong> Scheduled</p>
            <p><strong>Type:</strong> Initial Assessment</p>
            <button onclick="this.closest('.fixed').remove()" class="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function editAppointment(id) {
    // Show edit appointment modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 class="text-lg font-medium mb-4">Edit Appointment</h3>
            <form onsubmit="updateAppointment(event, ${id})">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Type</label>
                    <select class="mt-1 block w-full border-gray-300 rounded-md">
                        <option>Initial Assessment</option>
                        <option>Follow-up</option>
                        <option>Treatment</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <select class="mt-1 block w-full border-gray-300 rounded-md">
                        <option>Scheduled</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                </div>
                <div class="flex justify-end space-x-3">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function updateAppointment(event, id) {
    event.preventDefault();
    alert(`Appointment ${id} updated successfully!`);
    event.target.closest('.fixed').remove();
    loadAppointments();
}

function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        // Simulate delete
        alert(`Appointment ${id} deleted successfully!`);
        loadAppointments();
    }
}
