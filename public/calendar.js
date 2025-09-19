class CalendarManager {
    constructor() {
        this.appointments = [];
        this.contacts = [];
        this.currentDate = new Date();
        this.init();
    }

    async init() {
        await this.loadContacts();
        await this.loadAppointments();
        this.renderCalendar();
        this.setupEventListeners();
    }

    async loadContacts() {
        try {
            const response = await fetch('/api/contacts');
            this.contacts = await response.json();
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    }

    async loadAppointments() {
        try {
            const response = await fetch('/api/appointments');
            this.appointments = await response.json();
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('addAppointmentBtn').onclick = () => this.showAddModal();
        document.getElementById('prevMonth').onclick = () => this.changeMonth(-1);
        document.getElementById('nextMonth').onclick = () => this.changeMonth(1);
        
        document.querySelector('.close-appointment').onclick = () => this.hideModal();
        document.querySelector('.close-edit-appointment').onclick = () => this.hideEditModal();
        
        document.getElementById('appointmentForm').onsubmit = (e) => {
            e.preventDefault();
            this.addAppointment();
        };
        
        document.getElementById('editAppointmentForm').onsubmit = (e) => {
            e.preventDefault();
            this.updateAppointment();
        };
    }

    showAddModal() {
        const modal = document.getElementById('appointmentModal');
        const contactSelect = document.getElementById('contactId');
        
        contactSelect.innerHTML = '<option value="">Select Patient</option>' +
            this.contacts.map(c => `<option value="${c.id}">${c.first_name} ${c.last_name}</option>`).join('');
        
        modal.style.display = 'block';
    }

    hideModal() {
        document.getElementById('appointmentModal').style.display = 'none';
        document.getElementById('appointmentForm').reset();
    }

    hideEditModal() {
        document.getElementById('editAppointmentModal').style.display = 'none';
    }

    async addAppointment() {
        const formData = new FormData(document.getElementById('appointmentForm'));
        const appointmentData = {
            contact_id: formData.get('contactId'),
            appointment_date: formData.get('appointmentDate'),
            appointment_time: formData.get('appointmentTime'),
            service_type: formData.get('serviceType'),
            notes: formData.get('notes'),
            status: 'Scheduled'
        };

        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData)
            });

            if (response.ok) {
                this.hideModal();
                await this.loadAppointments();
                this.renderCalendar();
                this.showSuccessMessage('Appointment added successfully!');
            } else {
                const error = await response.json();
                this.showErrorMessage('Error: ' + error.error);
            }
        } catch (error) {
            this.showErrorMessage('Failed to add appointment');
        }
    }

    async editAppointment(id) {
        try {
            const response = await fetch(`/api/appointments/${id}`);
            const appointment = await response.json();
            
            document.getElementById('editAppointmentId').value = appointment.id;
            document.getElementById('editContactId').innerHTML = 
                this.contacts.map(c => `<option value="${c.id}" ${c.id == appointment.contact_id ? 'selected' : ''}>${c.first_name} ${c.last_name}</option>`).join('');
            document.getElementById('editAppointmentDate').value = appointment.appointment_date;
            document.getElementById('editAppointmentTime').value = appointment.appointment_time;
            document.getElementById('editServiceType').value = appointment.service_type;
            document.getElementById('editNotes').value = appointment.notes || '';
            document.getElementById('editStatus').value = appointment.status;
            
            document.getElementById('editAppointmentModal').style.display = 'block';
        } catch (error) {
            this.showErrorMessage('Error loading appointment');
        }
    }

    async updateAppointment() {
        const appointmentId = document.getElementById('editAppointmentId').value;
        const formData = new FormData(document.getElementById('editAppointmentForm'));
        const appointmentData = {
            contact_id: formData.get('contactId'),
            appointment_date: formData.get('appointmentDate'),
            appointment_time: formData.get('appointmentTime'),
            service_type: formData.get('serviceType'),
            notes: formData.get('notes'),
            status: formData.get('status')
        };

        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData)
            });

            if (response.ok) {
                this.hideEditModal();
                await this.loadAppointments();
                this.renderCalendar();
                this.showSuccessMessage('Appointment updated successfully!');
            } else {
                const error = await response.json();
                this.showErrorMessage('Error: ' + error.error);
            }
        } catch (error) {
            this.showErrorMessage('Failed to update appointment');
        }
    }

    async deleteAppointment(id) {
        if (confirm('Are you sure you want to delete this appointment?')) {
            try {
                const response = await fetch(`/api/appointments/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadAppointments();
                    this.renderCalendar();
                    this.showSuccessMessage('Appointment deleted successfully!');
                } else {
                    const error = await response.json();
                    this.showErrorMessage('Error: ' + error.error);
                }
            } catch (error) {
                this.showErrorMessage('Failed to delete appointment');
            }
        }
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    renderCalendar() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        
        document.getElementById('currentMonth').textContent = 
            `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';

        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const dayAppointments = this.appointments.filter(apt => 
                apt.appointment_date === cellDate.toISOString().split('T')[0]
            );

            const cell = document.createElement('div');
            cell.className = `min-h-24 p-2 border border-gray-200 ${
                cellDate.getMonth() !== this.currentDate.getMonth() ? 'bg-gray-50 text-gray-400' : 'bg-white'
            }`;
            
            cell.innerHTML = `
                <div class="font-medium text-sm">${cellDate.getDate()}</div>
                ${dayAppointments.map(apt => {
                    const contact = this.contacts.find(c => c.id == apt.contact_id);
                    return `
                        <div class="mt-1 p-1 text-xs bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
                             onclick="calendar.editAppointment(${apt.id})">
                            ${apt.appointment_time} - ${contact ? contact.first_name + ' ' + contact.last_name : 'Unknown'}
                        </div>
                    `;
                }).join('')}
            `;
            
            calendarGrid.appendChild(cell);
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
}

const calendar = new CalendarManager();
