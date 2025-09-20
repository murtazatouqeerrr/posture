// Dashboard JavaScript - No Authentication
console.log('📊 Dashboard module loaded');

// No authentication checks - direct access
function loadDashboard() {
    console.log('📊 Loading dashboard data...');
    // Dashboard loading is handled by app.js
}

// Export for use by app.js
if (typeof window !== 'undefined') {
    window.loadDashboard = loadDashboard;
}
