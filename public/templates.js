document.addEventListener('DOMContentLoaded', function() {
    loadTemplates();
});

async function loadTemplates() {
    try {
        const response = await fetch('/api/treatment-plans');
        const templates = await response.json();
        displayTemplates(templates);
    } catch (error) {
        console.error('Error loading templates:', error);
        document.getElementById('templatesGrid').innerHTML = 
            '<div class="col-span-full text-center text-red-500">Error loading templates</div>';
    }
}

function displayTemplates(templates) {
    const grid = document.getElementById('templatesGrid');
    
    if (templates.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-gray-500">No templates found.</div>';
        return;
    }
    
    grid.innerHTML = templates.map(template => `
        <div class="bg-white rounded-lg shadow border p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">${template.name}</h3>
                <span class="text-2xl font-bold text-primary">$${template.price}</span>
            </div>
            
            <p class="text-gray-600 mb-4">${template.description}</p>
            
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-gray-500">Duration: ${template.duration}</span>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="viewTemplate(${template.id})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                    View Details
                </button>
                <button onclick="sendTemplate(${template.id})" class="flex-1 bg-primary hover:bg-teal-700 text-white px-4 py-2 rounded text-sm">
                    Send to Patient
                </button>
            </div>
        </div>
    `).join('');
}

function viewTemplate(id) {
    alert(`Viewing template ${id} details`);
}

function sendTemplate(id) {
    alert(`Sending template ${id} to patient`);
}
