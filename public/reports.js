class ReportsManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadReports();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('refreshReports').onclick = () => this.loadReports();
    }

    async loadReports() {
        try {
            await Promise.all([
                this.loadLeadsChart(),
                this.loadConversionChart(),
                this.loadRevenueChart(),
                this.loadRecentActivity()
            ]);
        } catch (error) {
            console.error('Error loading reports:', error);
            this.showErrorMessage('Failed to load reports');
        }
    }

    async loadLeadsChart() {
        try {
            const response = await fetch('/api/reports/leads-per-month');
            const data = await response.json();
            
            const ctx = document.getElementById('leadsChart').getContext('2d');
            
            if (this.charts.leads) {
                this.charts.leads.destroy();
            }
            
            this.charts.leads = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.month),
                    datasets: [{
                        label: 'New Leads',
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
                            text: 'Leads Per Month'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading leads chart:', error);
        }
    }

    async loadConversionChart() {
        try {
            const response = await fetch('/api/reports/conversion-rate');
            const data = await response.json();
            
            const ctx = document.getElementById('conversionChart').getContext('2d');
            
            if (this.charts.conversion) {
                this.charts.conversion.destroy();
            }
            
            this.charts.conversion = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Converted', 'Not Converted'],
                    datasets: [{
                        data: [data.converted, data.total - data.converted],
                        backgroundColor: [
                            'rgb(34, 197, 94)',
                            'rgb(239, 68, 68)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Conversion Rate: ${data.rate}%`
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading conversion chart:', error);
        }
    }

    async loadRevenueChart() {
        try {
            const response = await fetch('/api/reports/revenue-per-month');
            const data = await response.json();
            
            const ctx = document.getElementById('revenueChart').getContext('2d');
            
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
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 1
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
        } catch (error) {
            console.error('Error loading revenue chart:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const [contactsRes, appointmentsRes, invoicesRes] = await Promise.all([
                fetch('/api/contacts?limit=5'),
                fetch('/api/appointments?limit=5'),
                fetch('/api/invoices?limit=5')
            ]);
            
            const contacts = await contactsRes.json();
            const appointments = await appointmentsRes.json();
            const invoices = await invoicesRes.json();
            
            const activityList = document.getElementById('recentActivity');
            const activities = [];
            
            contacts.slice(0, 3).forEach(contact => {
                activities.push({
                    type: 'contact',
                    text: `New patient: ${contact.first_name} ${contact.last_name}`,
                    time: contact.created_at || 'Recently'
                });
            });
            
            appointments.slice(0, 3).forEach(appointment => {
                activities.push({
                    type: 'appointment',
                    text: `Appointment scheduled for ${appointment.appointment_date}`,
                    time: appointment.created_at || 'Recently'
                });
            });
            
            invoices.slice(0, 3).forEach(invoice => {
                activities.push({
                    type: 'invoice',
                    text: `Invoice #${invoice.id} created ($${invoice.amount})`,
                    time: invoice.created_at || 'Recently'
                });
            });
            
            activityList.innerHTML = activities.slice(0, 10).map(activity => `
                <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded">
                    <div class="flex-shrink-0">
                        ${this.getActivityIcon(activity.type)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-900">${activity.text}</p>
                        <p class="text-xs text-gray-500">${activity.time}</p>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    getActivityIcon(type) {
        const icons = {
            contact: '<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg></div>',
            appointment: '<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v9H4V7z"></path></svg></div>',
            invoice: '<div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"></path></svg></div>'
        };
        return icons[type] || icons.contact;
    }

    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

const reportsManager = new ReportsManager();
