// Calendar Management
let currentCalendarDate = new Date();
let appointments = [];
let contacts = [];

async function loadCalendarView() {
    console.log('📅 Loading calendar view...');
    try {
        const [appointmentsResponse, contactsResponse] = await Promise.all([
            fetch('/api/appointments'),
            fetch('/api/contacts')
        ]);

        if (!appointmentsResponse.ok) {
            throw new Error(`Failed to fetch appointments: ${appointmentsResponse.status}`);
        }
        if (!contactsResponse.ok) {
            throw new Error(`Failed to fetch contacts: ${contactsResponse.status}`);
        }

        appointments = await appointmentsResponse.json();
        contacts = await contactsResponse.json();

        // Map fields for compatibility
        appointments = appointments.map(apt => {
            if (apt.date_time) {
                const [date, time] = apt.date_time.split('T');
                apt.appointment_date = date;
                apt.appointment_time = time ? time.slice(0,5) : '';
            }
            if (apt.type) {
                apt.service_type = apt.type;
            }
            const contact = contacts.find(c => c.id === apt.contact_id);
            if (contact) {
                apt.first_name = contact.first_name;
                apt.last_name = contact.last_name;
            }
            return apt;
        });

        console.log(`✅ Loaded ${appointments.length} appointments and ${contacts.length} contacts`);
        renderCalendarView();
    } catch (error) {
        console.error('❌ Calendar loading error:', error);
        document.getElementById('app').innerHTML = `
            <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 class="text-red-800 font-medium">Error Loading Calendar</h3>
                    <p class="text-red-700 mt-2">${error.message}</p>
                    <button onclick="loadCalendarView()" class="mt-3 bg-red-100 px-3 py-2 rounded text-red-800 hover:bg-red-200">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}


function renderCalendarView() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">Calendar</h2>
                    <p class="text-gray-600">Manage appointments and schedule</p>
                </div>
                <button id="addAppointmentBtn" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                    Add Appointment
                </button>
            </div>

            <!-- Calendar Navigation -->
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="flex items-center justify-between p-4 border-b">
                    <div class="flex items-center space-x-4">
                        <button id="prevMonth" class="p-2 hover:bg-gray-100 rounded">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <h3 id="currentMonth" class="text-lg font-semibold text-gray-900"></h3>
                        <button id="nextMonth" class="p-2 hover:bg-gray-100 rounded">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                    <button id="todayBtn" class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        Today
                    </button>
                </div>
                
                <!-- Calendar Grid -->
                <div class="p-4">
                    <div class="grid grid-cols-7 gap-1 mb-2">
                        <div class="p-2 text-center text-sm font-medium text-gray-500">Sun</div>
                        <div class="p-2 text-center text-sm font-medium text-gray-500">Mon</div>
                        <div class="p-2 text-center text-sm font-medium text-gray-500">Tue</div>
                        <div class="p-2 text-center text-sm font-medium text-gray-500">Wed</div>
                        <div class="p-2 text-center text-sm font-medium text-gray-500">Thu</div>
                        <div class="p-2 text-center text-sm font-medium text-gray-500">Fri</div>
                        <div class="p-2 text-center text-sm font-medium text-gray-500">Sat</div>
                    </div>
                    <div id="calendarGrid" class="grid grid-cols-7 gap-1">
                        <!-- Calendar days will be inserted here -->
                    </div>
                </div>
            </div>

            <!-- Upcoming Appointments -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
                </div>
                <div id="upcomingAppointments" class="divide-y divide-gray-200">
                    <!-- Appointments will be listed here -->
                </div>
            </div>
        </div>
    `;

    // Setup event listeners
    setupCalendarEventListeners();
    
    // Render calendar
    renderCalendar();
    renderUpcomingAppointments();
}

function setupCalendarEventListeners() {
    // Add appointment button
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', showAddAppointmentModal);
    }

    // Calendar navigation
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    const todayBtn = document.getElementById('todayBtn');

    if (prevMonth) {
        prevMonth.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonth) {
        nextMonth.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            currentCalendarDate = new Date();
            renderCalendar();
        });
    }
}

function renderCalendar() {
    const currentMonth = document.getElementById('currentMonth');
    const calendarGrid = document.getElementById('calendarGrid');
    
    if (!currentMonth || !calendarGrid) return;

    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonth.textContent = `${monthNames[currentCalendarDate.getMonth()]} ${currentCalendarDate.getFullYear()}`;

    // Calculate calendar days
    const firstDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
    const lastDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Clear calendar grid
    calendarGrid.innerHTML = '';

    // Generate calendar days
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === currentCalendarDate.getMonth();
        const isToday = date.toDateString() === new Date().toDateString();
        
        // Get appointments for this date
        const dateStr = date.toISOString().split('T')[0];
        const dayAppointments = appointments.filter(apt => apt.appointment_date === dateStr);
        
        const dayElement = document.createElement('div');
        dayElement.className = `p-2 min-h-[80px] border border-gray-200 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${isToday ? 'bg-blue-50 border-blue-200' : ''} hover:bg-gray-50 cursor-pointer`;
        
        dayElement.innerHTML = `
            <div class="text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday ? 'font-bold text-blue-600' : ''} mb-1">
                ${date.getDate()}
            </div>
            <div class="space-y-1">
                ${dayAppointments.slice(0, 2).map(apt => `
                    <div class="text-xs bg-primary text-white px-1 py-0.5 rounded truncate" title="${apt.first_name} ${apt.last_name} - ${apt.service_type}">
                        ${apt.appointment_time} ${apt.first_name} ${apt.last_name}
                    </div>
                `).join('')}
                ${dayAppointments.length > 2 ? `<div class="text-xs text-gray-500">+${dayAppointments.length - 2} more</div>` : ''}
            </div>
        `;
        
        dayElement.addEventListener('click', () => showDayAppointments(date, dayAppointments));
        calendarGrid.appendChild(dayElement);
    }
}

function renderUpcomingAppointments() {
    const upcomingAppointments = document.getElementById('upcomingAppointments');
    if (!upcomingAppointments) return;

    // Get upcoming appointments (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const upcoming = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= today && aptDate <= nextWeek;
    }).sort((a, b) => new Date(a.appointment_date + ' ' + a.appointment_time) - new Date(b.appointment_date + ' ' + b.appointment_time));

    if (upcoming.length === 0) {
        upcomingAppointments.innerHTML = `
            <div class="p-6 text-center text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z"></path>
                </svg>
                <p>No upcoming appointments</p>
            </div>
        `;
        return;
    }

    upcomingAppointments.innerHTML = upcoming.map(apt => `
        <div class="p-4 hover:bg-gray-50">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-medium">${apt.first_name.charAt(0)}${apt.last_name.charAt(0)}</span>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${apt.first_name} ${apt.last_name}</div>
                        <div class="text-sm text-gray-500">${apt.service_type}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">${formatDate(apt.appointment_date)}</div>
                    <div class="text-sm text-gray-500">${apt.appointment_time}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}">
                        ${apt.status}
                    </span>
                    <button onclick="editAppointment(${apt.id})" class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showAddAppointmentModal() {
    console.log('➕ Showing add appointment modal...');
    
    if (contacts.length === 0) {
        showNotification('No patients available. Please add patients first.', 'warning');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Add New Appointment</h3>
                <button id="closeModal" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form id="appointmentForm">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                        <select id="contactId" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                            <option value="">Select a patient</option>
                            ${contacts.map(contact => `
                                <option value="${contact.id}">${contact.first_name} ${contact.last_name}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" id="appointmentDate" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input type="time" id="appointmentTime" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                        <select id="serviceType" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                            <option value="">Select service type</option>
                            <option value="Initial Assessment">Initial Assessment</option>
                            <option value="Physical Therapy">Physical Therapy</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Consultation">Consultation</option>
                            <option value="Posture Assessment">Posture Assessment</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea id="appointmentNotes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" placeholder="Additional notes..."></textarea>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button type="submit" class="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        Create Appointment
                    </button>
                    <button type="button" id="cancelBtn" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').value = today;

    // Event listeners
    document.getElementById('closeModal').addEventListener('click', () => modal.remove());
    document.getElementById('cancelBtn').addEventListener('click', () => modal.remove());
    
    document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
      // Combine date and time into one string
const date = document.getElementById('appointmentDate').value;
const time = document.getElementById('appointmentTime').value;
const date_time = `${date}T${time}`; // ISO format

const formData = {
    contact_id: document.getElementById('contactId').value,
    date_time: date_time,
    type: document.getElementById('serviceType').value,
    notes: document.getElementById('appointmentNotes').value,
    status: 'Scheduled'
};

        try {
            const response = await fetch('/api/appointments', {
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
            console.log('✅ Appointment created:', result);
            
            showNotification('Appointment created successfully!', 'success');
            modal.remove();
            
            // Reload calendar view
            await loadCalendarView();
            
        } catch (error) {
            console.error('❌ Error creating appointment:', error);
            showNotification('Failed to create appointment. Please try again.', 'error');
        }
    });
}

function showDayAppointments(date, dayAppointments) {
    console.log(`📅 Showing appointments for ${date.toDateString()}`);
    
    if (dayAppointments.length === 0) {
        showNotification(`No appointments on ${formatDate(date.toISOString().split('T')[0])}`, 'info');
        return;
    }

    // Show appointments for the day
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Appointments - ${formatDate(date.toISOString().split('T')[0])}</h3>
                <button id="closeDayModal" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-3">
                ${dayAppointments.map(apt => `
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-medium text-gray-900">${apt.first_name} ${apt.last_name}</div>
                                <div class="text-sm text-gray-500">${apt.service_type}</div>
                                <div class="text-sm text-gray-500">${apt.appointment_time}</div>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}">
                                ${apt.status}
                            </span>
                        </div>
                        ${apt.notes ? `<div class="mt-2 text-sm text-gray-600">${apt.notes}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('closeDayModal').addEventListener('click', () => modal.remove());
}

function editAppointment(appointmentId) {
    console.log(`✏️ Editing appointment ${appointmentId}`);
    showNotification(`Edit appointment ${appointmentId} - Feature coming soon!`, 'info');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function getStatusColor(status) {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'Scheduled':
            return 'bg-blue-100 text-blue-800';
        case 'Cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}
