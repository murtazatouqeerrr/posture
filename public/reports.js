document.addEventListener('DOMContentLoaded', function() {
    loadConversionRate();
    loadLeadsChart();
    loadRevenueChart();

    function loadConversionRate() {
        fetch('/api/reports/conversion-rate')
            .then(response => response.json())
            .then(data => {
                document.getElementById('conversionRate').textContent = `${data.conversion_rate}%`;
            });
    }

    function loadLeadsChart() {
        fetch('/api/reports/leads-per-month')
            .then(response => response.json())
            .then(data => {
                const ctx = document.getElementById('leadsChart').getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.map(item => item.month),
                        datasets: [{
                            label: 'Leads',
                            data: data.map(item => item.count),
                            borderColor: '#3498db',
                            backgroundColor: 'rgba(52, 152, 219, 0.1)',
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
            });
    }

    function loadRevenueChart() {
        fetch('/api/reports/revenue-per-month')
            .then(response => response.json())
            .then(data => {
                const ctx = document.getElementById('revenueChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.map(item => item.month),
                        datasets: [{
                            label: 'Revenue ($)',
                            data: data.map(item => item.revenue || 0),
                            backgroundColor: '#2ecc71',
                            borderColor: '#27ae60',
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
            });
    }
});
