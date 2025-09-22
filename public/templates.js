// Templates data
let templatesData = [];

async function loadTemplatesView() {
    console.log('📄 Loading templates view...');
    
    try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
            throw new Error(`Failed to fetch templates: ${response.status}`);
        }
        
        templatesData = await response.json();
        console.log('✅ Templates loaded:', templatesData.length, 'templates');
        renderTemplatesView();
    } catch (error) {
        console.error('❌ Templates loading error:', error);
        document.getElementById('app').innerHTML = `
            <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 class="text-red-800 font-medium">Error Loading Templates</h3>
                    <p class="text-red-700 mt-2">${error.message}</p>
                    <button onclick="loadTemplatesView()" class="mt-3 bg-red-100 px-3 py-2 rounded text-red-800 hover:bg-red-200">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderTemplatesView() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="p-6">
            <div class="mb-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Email & Document Templates</h2>
                        <p class="text-gray-600">Manage your communication templates</p>
                    </div>
                    <button onclick="showCreateTemplateModal()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        New Template
                    </button>
                </div>
            </div>

            <!-- Templates Grid -->
            <div id="templatesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${templatesData.length > 0 ? templatesData.map(template => `
                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <div class="p-2 rounded-lg ${getTemplateTypeColor(template.type)}">
                                    ${getTemplateTypeIcon(template.type)}
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-lg font-semibold text-gray-900">${template.name}</h3>
                                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${getTemplateTypeBadge(template.type)}">
                                        ${template.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        ${template.subject ? `
                            <div class="mb-3">
                                <p class="text-sm font-medium text-gray-600">Subject:</p>
                                <p class="text-sm text-gray-800">${template.subject}</p>
                            </div>
                        ` : ''}
                        
                        <div class="mb-4">
                            <p class="text-sm font-medium text-gray-600">Content Preview:</p>
                            <p class="text-sm text-gray-700 line-clamp-3">${template.content ? template.content.substring(0, 100) + '...' : 'No content'}</p>
                        </div>
                        
                        ${template.variables ? `
                            <div class="mb-4">
                                <p class="text-sm font-medium text-gray-600">Variables:</p>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    ${JSON.parse(template.variables || '[]').map(variable => `
                                        <span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${variable}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="flex justify-between items-center pt-4 border-t">
                            <button onclick="editTemplate(${template.id})" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Edit
                            </button>
                            <div class="flex space-x-2">
                                <button onclick="useTemplate(${template.id})" class="bg-green-100 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-200">
                                    Use Template
                                </button>
                                <button onclick="deleteTemplate(${template.id})" class="text-red-600 hover:text-red-800 text-sm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="col-span-full text-center py-12">
                        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
                        <p class="text-gray-500 mb-4">Create your first template to get started</p>
                        <button onclick="showCreateTemplateModal()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                            Create Template
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}

function getTemplateTypeIcon(type) {
    switch (type) {
        case 'EMAIL':
            return '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
        case 'SMS':
            return '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>';
        case 'DOCUMENT':
            return '<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
        default:
            return '<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
    }
}

function getTemplateTypeColor(type) {
    switch (type) {
        case 'EMAIL':
            return 'bg-blue-100';
        case 'SMS':
            return 'bg-green-100';
        case 'DOCUMENT':
            return 'bg-purple-100';
        default:
            return 'bg-gray-100';
    }
}

function getTemplateTypeBadge(type) {
    switch (type) {
        case 'EMAIL':
            return 'bg-blue-100 text-blue-800';
        case 'SMS':
            return 'bg-green-100 text-green-800';
        case 'DOCUMENT':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}
function showCreateTemplateModal() {
    // Remove any existing modal
    const existing = document.getElementById('createTemplateModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'createTemplateModal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Create New Template</h3>
                <button id="closeCreateTemplateModal" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="createTemplateForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Type</label>
                    <select name="type" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="DOCUMENT">Document</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Subject</label>
                    <input type="text" name="subject" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Content</label>
                    <textarea name="content" rows="4" required class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Variables (comma separated)</label>
                    <input type="text" name="variables" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. patient_name, appointment_date">
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" id="cancelCreateTemplate" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                        Create Template
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeCreateTemplateModal').onclick =
    document.getElementById('cancelCreateTemplate').onclick = () => modal.remove();

    document.getElementById('createTemplateForm').onsubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            type: form.type.value,
            subject: form.subject.value,
            content: form.content.value,
            variables: JSON.stringify(form.variables.value.split(',').map(v => v.trim()).filter(Boolean))
        };
        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create template');
            modal.remove();
            loadTemplatesView();
        } catch (err) {
            alert('Error creating template: ' + err.message);
        }
    };
}
function editTemplate(templateId) {
    const template = templatesData.find(t => t.id === templateId);
    if (!template) return alert('Template not found');

    // Remove any existing modal
    const existing = document.getElementById('createTemplateModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'createTemplateModal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Edit Template</h3>
                <button id="closeCreateTemplateModal" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="editTemplateForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${template.name}">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Type</label>
                    <select name="type" required class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="EMAIL" ${template.type === 'EMAIL' ? 'selected' : ''}>Email</option>
                        <option value="SMS" ${template.type === 'SMS' ? 'selected' : ''}>SMS</option>
                        <option value="DOCUMENT" ${template.type === 'DOCUMENT' ? 'selected' : ''}>Document</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Subject</label>
                    <input type="text" name="subject" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${template.subject || ''}">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Content</label>
                    <textarea name="content" rows="4" required class="w-full px-3 py-2 border border-gray-300 rounded-md">${template.content || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Variables (comma separated)</label>
                    <input type="text" name="variables" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${template.variables ? JSON.parse(template.variables).join(', ') : ''}">
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" id="cancelCreateTemplate" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeCreateTemplateModal').onclick =
    document.getElementById('cancelCreateTemplate').onclick = () => modal.remove();

    document.getElementById('editTemplateForm').onsubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            type: form.type.value,
            subject: form.subject.value,
            content: form.content.value,
            variables: JSON.stringify(form.variables.value.split(',').map(v => v.trim()).filter(Boolean))
        };
        try {
            const response = await fetch(`/api/templates/${templateId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update template');
            modal.remove();
            loadTemplatesView();
        } catch (err) {
            alert('Error updating template: ' + err.message);
        }
    };
}
function useTemplate(templateId) {
    // Implementation for use template
    console.log('Use template:', templateId);
}

function deleteTemplate(templateId) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to delete template');
        loadTemplatesView();
    })
    .catch(err => alert('Error deleting template: ' + err.message));
}
