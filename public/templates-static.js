// Templates Management - Static HTML Version
let templates = [];

// Load templates when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTemplates();
});

async function loadTemplates() {
    console.log('📋 Loading templates...');
    
    try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
            throw new Error(`Failed to fetch templates: ${response.status}`);
        }
        
        templates = await response.json();
        console.log(`✅ Loaded ${templates.length} templates`);
        
        renderTemplatesGrid();
    } catch (error) {
        console.error('❌ Templates loading error:', error);
        const grid = document.getElementById('templatesGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-red-600">
                        <p class="font-medium">Error Loading Templates</p>
                        <p class="text-sm mt-1">${error.message}</p>
                        <button onclick="loadTemplates()" class="mt-2 bg-red-100 px-3 py-2 rounded text-red-800 hover:bg-red-200">
                            Retry
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

function renderTemplatesGrid() {
    const grid = document.getElementById('templatesGrid');
    if (!grid) {
        console.error('❌ Templates grid not found');
        return;
    }

    if (templates.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
                <p class="text-gray-500 mb-4">Get started by creating your first email or document template</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = templates.map(template => `
        <div class="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <div class="p-2 rounded-lg ${getTypeColor(template.type)} mr-3">
                            ${getTypeIcon(template.type)}
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">${template.name || 'Untitled Template'}</h3>
                            <span class="text-xs px-2 py-1 rounded-full ${getTypeBadgeColor(template.type)}">${(template.type || 'unknown').toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="editTemplate(${template.id})" class="text-blue-600 hover:text-blue-800">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="deleteTemplate(${template.id})" class="text-red-600 hover:text-red-800">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                ${template.subject ? `<p class="text-gray-600 text-sm mb-2 font-medium">${template.subject}</p>` : ''}
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">${(template.content || 'No content').substring(0, 150)}${(template.content || '').length > 150 ? '...' : ''}</p>
                
                ${template.variables ? `
                    <div class="mb-4">
                        <p class="text-xs text-gray-500 mb-2">Variables:</p>
                        <div class="flex flex-wrap gap-1">
                            ${template.variables.split(',').map(variable => `
                                <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">[${variable.trim()}]</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="mt-4 pt-4 border-t">
                    <button onclick="useTemplate(${template.id})" class="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 text-sm">
                        Use Template
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getTypeColor(type) {
    switch (type) {
        case 'email':
            return 'bg-blue-100';
        case 'sms':
            return 'bg-green-100';
        default:
            return 'bg-gray-100';
    }
}

function getTypeBadgeColor(type) {
    switch (type) {
        case 'email':
            return 'bg-blue-100 text-blue-800';
        case 'sms':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getTypeIcon(type) {
    switch (type) {
        case 'email':
            return '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
        case 'sms':
            return '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>';
        default:
            return '<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
    }
}

// Placeholder functions for actions
function editTemplate(templateId) {
    console.log(`✏️ Editing template ${templateId}`);
    alert(`Edit template ${templateId} - Feature coming soon!`);
}

function deleteTemplate(templateId) {
    console.log(`🗑️ Deleting template ${templateId}`);
    if (confirm('Are you sure you want to delete this template?')) {
        alert(`Delete template ${templateId} - Feature coming soon!`);
    }
}

function useTemplate(templateId) {
    console.log(`📤 Using template ${templateId}`);
    alert(`Use template ${templateId} - Feature coming soon!`);
}