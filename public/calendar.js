document.addEventListener('DOMContentLoaded', function() {
    loadAppointments();
    
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    if (addAppointmentBtn) {
        addAppointmentBtn.onclick = () => alert('Add appointment functionality - Demo');
    }
});

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
                <button onclick="viewAppointment(${appointment.id})" class="text-blue-600 hover:text-blue-900">View</button>
                <button onclick="editAppointment(${appointment.id})" class="text-yellow-600 hover:text-yellow-900">Edit</button>
                <button onclick="deleteAppointment(${appointment.id})" class="text-red-600 hover:text-red-900">Delete</button>
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

function viewAppointment(id) {
    alert(`Viewing appointment ${id}`);
}

function editAppointment(id) {
    alert(`Editing appointment ${id}`);
}

function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        alert(`Deleting appointment ${id}`);
    }
}
