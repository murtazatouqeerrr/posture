// Reports Management - Fixed Data Fetching
let reportsData = {
    leadsPerMonth: [],
    conversionRate: [],
    revenuePerMonth: [],
    financialAnalytics: null
};

async function loadReportsView() {
    console.log('📊 Loading reports view...');
    
    try {
        // Fetch all report data
        const [leadsResponse, conversionResponse, revenueResponse, analyticsResponse] = await Promise.all([
            fetch('/api/reports/leads-per-month'),
            fetch('/api/reports/conversion-rate'),
            fetch('/api/reports/revenue-per-month'),
            fetch('/api/admin/analytics/financial')
        ]);

        if (!leadsResponse.ok || !conversionResponse.ok || !revenueResponse.ok || !analyticsResponse.ok) {
            throw new Error('Failed to fetch report data');
        }

        reportsData.leadsPerMonth = await leadsResponse.json();
        reportsData.conversionRate = await conversionResponse.json();
        reportsData.revenuePerMonth = await revenueResponse.json();
        reportsData.financialAnalytics = await analyticsResponse.json();
        
        console.log('✅ Reports data loaded successfully');
        renderReportsView();
    } catch (error) {
        console.error('❌ Reports loading error:', error);
        document.getElementById('app').innerHTML = `
            <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 class="text-red-800 font-medium">Error Loading Reports</h3>
                    <p class="text-red-700 mt-2">${error.message}</p>
                    <button onclick="loadReportsView()" class="mt-3 bg-red-100 px-3 py-2 rounded text-red-800 hover:bg-red-200">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderReportsView() {
    const analytics = reportsData.financialAnalytics;
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">Business Reports & Analytics</h2>
                <p class="text-gray-600">Comprehensive insights into your practice performance</p>
            </div>

            <!-- Financial Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p class="text-2xl font-semibold text-gray-900">$${analytics.totalRevenue}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Monthly Revenue</p>
                            <p class="text-2xl font-semibold text-gray-900">$${analytics.monthlyRevenue}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-purple-100 rounded-lg">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Invoices</p>
                            <p class="text-2xl font-semibold text-gray-900">${analytics.totalInvoices}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-yellow-100 rounded-lg">
                            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Active Subscriptions</p>
                            <p class="text-2xl font-semibold text-gray-900">${analytics.activeSubscriptions}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Revenue Trends Chart -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Trends</h3>
                    <div class="h-64">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>
                
                <!-- Revenue by Service Chart -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue by Service</h3>
                    <div class="h-64">
                        <canvas id="serviceChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Invoice Status Overview -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Invoice Status Overview</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <p class="text-2xl font-bold text-green-600">${analytics.paidInvoices}</p>
                        <p class="text-sm text-green-700">Paid Invoices</p>
                    </div>
                    <div class="text-center p-4 bg-yellow-50 rounded-lg">
                        <p class="text-2xl font-bold text-yellow-600">${analytics.pendingInvoices}</p>
                        <p class="text-sm text-yellow-700">Pending Invoices</p>
                    </div>
                    <div class="text-center p-4 bg-red-50 rounded-lg">
                        <p class="text-2xl font-bold text-red-600">${analytics.overdueInvoices}</p>
                        <p class="text-sm text-red-700">Overdue Invoices</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize charts after DOM is ready
    setTimeout(() => {
        initializeCharts();
    }, 100);
}

function initializeCharts() {
    const analytics = reportsData.financialAnalytics;
    
    // Revenue Trends Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: analytics.monthlyTrends.map(item => item.month),
                datasets: [{
                    label: 'Revenue ($)',
                    data: analytics.monthlyTrends.map(item => item.revenue),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
    
    // Revenue by Service Chart
    const serviceCtx = document.getElementById('serviceChart');
    if (serviceCtx) {
        new Chart(serviceCtx, {
            type: 'doughnut',
            data: {
                labels: analytics.revenueByService.map(item => item.service),
                datasets: [{
                    data: analytics.revenueByService.map(item => parseFloat(item.revenue)),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}
