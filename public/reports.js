document.addEventListener('DOMContentLoaded', function() {
    loadReports();
});

async function loadReports() {
    try {
        // Load conversion rate
        const conversionResponse = await fetch('/api/reports/conversion-rate');
        const conversionData = await conversionResponse.json();
        document.getElementById('conversionRate').textContent = `${conversionData.rate}%`;
        
        // Load leads per month
        const leadsResponse = await fetch('/api/reports/leads-per-month');
        const leadsData = await leadsResponse.json();
        createLeadsChart(leadsData);
        
        // Load revenue per month
        const revenueResponse = await fetch('/api/reports/revenue-per-month');
        const revenueData = await revenueResponse.json();
        createRevenueChart(revenueData);
        
    } catch (error) {
        console.error('Error loading reports:', error);
        document.getElementById('conversionRate').textContent = 'Error loading data';
    }
}

function createLeadsChart(data) {
    const ctx = document.getElementById('leadsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.month),
            datasets: [{
                label: 'Leads',
                data: data.map(item => item.count),
                backgroundColor: '#3B82F6',
                borderColor: '#2563EB',
                borderWidth: 1
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

function createRevenueChart(data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.month),
            datasets: [{
                label: 'Revenue ($)',
                data: data.map(item => item.revenue),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
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
