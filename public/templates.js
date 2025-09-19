// Treatment Templates Management
let treatmentPlans = [];

async function loadTemplatesView() {
    console.log('📋 Loading treatment templates...');
    
    try {
        const response = await fetch('/api/treatment-plans');
        if (!response.ok) {
            throw new Error(`Failed to fetch treatment plans: ${response.status}`);
        }
        
        treatmentPlans = await response.json();
        console.log(`✅ Loaded ${treatmentPlans.length} treatment plans`);
        
        renderTemplatesView();
    } catch (error) {
        console.error('❌ Templates loading error:', error);
        document.getElementById('app').innerHTML = `
            <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
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
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">Treatment Templates</h2>
                    <p class="text-gray-600">Manage standardized treatment plans and templates</p>
                </div>
                <button id="addTemplateBtn" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                    Add New Template
                </button>
            </div>

            <!-- Templates Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${treatmentPlans.length > 0 ? treatmentPlans.map(plan => `
                    <div class="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900">${plan.name}</h3>
                                <div class="flex items-center space-x-2">
                                    <button onclick="editTemplate(${plan.id})" class="text-blue-600 hover:text-blue-800">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button onclick="deleteTemplate(${plan.id})" class="text-red-600 hover:text-red-800">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <p class="text-gray-600 text-sm mb-4">${plan.description}</p>
                            
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Duration:</span>
                                    <span class="font-medium">${plan.duration_weeks} weeks</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Sessions/Week:</span>
                                    <span class="font-medium">${plan.sessions_per_week}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Price/Session:</span>
                                    <span class="font-medium text-green-600">$${plan.price_per_session}</span>
                                </div>
                                <div class="flex justify-between border-t pt-2 mt-2">
                                    <span class="text-gray-500">Total Cost:</span>
                                    <span class="font-semibold text-lg text-green-600">$${(plan.duration_weeks * plan.sessions_per_week * plan.price_per_session).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div class="mt-4 pt-4 border-t">
                                <button onclick="useTemplate(${plan.id})" class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark text-sm">
                                    Use Template
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="col-span-full text-center py-12">
                        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
                        <p class="text-gray-500 mb-4">Get started by creating your first treatment template</p>
                        <button onclick="showAddTemplateModal()" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                            Create Template
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;

    // Setup event listeners
    const addTemplateBtn = document.getElementById('addTemplateBtn');
    if (addTemplateBtn) {
        addTemplateBtn.addEventListener('click', showAddTemplateModal);
    }
}

function showAddTemplateModal() {
    console.log('➕ Showing add template modal...');
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Add New Treatment Template</h3>
                <button id="closeModal" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form id="templateForm">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                        <input type="text" id="templateName" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" placeholder="e.g., Lower Back Pain Recovery">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="templateDescription" required rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" placeholder="Describe the treatment plan..."></textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
                            <input type="number" id="templateDuration" required min="1" max="52" value="6" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sessions/Week</label>
                            <input type="number" id="templateSessions" required min="1" max="7" value="2" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Price per Session ($)</label>
                        <input type="number" id="templatePrice" required min="0" step="0.01" value="120.00" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                    </div>
                    
                    <div class="bg-gray-50 p-3 rounded-md">
                        <div class="text-sm text-gray-600">
                            <div class="flex justify-between">
                                <span>Total Sessions:</span>
                                <span id="totalSessions">12</span>
                            </div>
                            <div class="flex justify-between font-medium">
                                <span>Total Cost:</span>
                                <span id="totalCost">$1,440.00</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button type="submit" class="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        Create Template
                    </button>
                    <button type="button" id="cancelBtn" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Calculate totals on input change
    const updateTotals = () => {
        const duration = parseInt(document.getElementById('templateDuration').value) || 0;
        const sessions = parseInt(document.getElementById('templateSessions').value) || 0;
        const price = parseFloat(document.getElementById('templatePrice').value) || 0;
        
        const totalSessions = duration * sessions;
        const totalCost = totalSessions * price;
        
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('totalCost').textContent = `$${totalCost.toFixed(2)}`;
    };

    // Event listeners
    document.getElementById('templateDuration').addEventListener('input', updateTotals);
    document.getElementById('templateSessions').addEventListener('input', updateTotals);
    document.getElementById('templatePrice').addEventListener('input', updateTotals);
    
    document.getElementById('closeModal').addEventListener('click', () => modal.remove());
    document.getElementById('cancelBtn').addEventListener('click', () => modal.remove());
    
    document.getElementById('templateForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('templateName').value,
            description: document.getElementById('templateDescription').value,
            duration_weeks: parseInt(document.getElementById('templateDuration').value),
            sessions_per_week: parseInt(document.getElementById('templateSessions').value),
            price_per_session: parseFloat(document.getElementById('templatePrice').value)
        };

        try {
            const response = await fetch('/api/treatment-plans', {
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
            console.log('✅ Template created:', result);
            
            showNotification('Treatment template created successfully!', 'success');
            modal.remove();
            
            // Reload templates view
            await loadTemplatesView();
            
        } catch (error) {
            console.error('❌ Error creating template:', error);
            showNotification('Failed to create template. Please try again.', 'error');
        }
    });

    // Initial calculation
    updateTotals();
}

function editTemplate(templateId) {
    console.log(`✏️ Editing template ${templateId}`);
    
    const template = treatmentPlans.find(t => t.id === templateId);
    if (!template) {
        showNotification('Template not found', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'editTemplateModal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Edit Template</h3>
                    <button onclick="closeEditTemplateModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <form id="editTemplateForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Template Name</label>
                        <input type="text" name="name" value="${template.name}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" rows="3" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">${template.description}</textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Duration (weeks)</label>
                            <input type="number" name="duration_weeks" value="${template.duration_weeks}" min="1" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Sessions per week</label>
                            <input type="number" name="sessions_per_week" value="${template.sessions_per_week}" min="1" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Price per session ($)</label>
                        <input type="number" name="price_per_session" value="${template.price_per_session}" step="0.01" min="0" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeEditTemplateModal()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">Update Template</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('editTemplateForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateTemplate(templateId, new FormData(e.target));
    });
}

function deleteTemplate(templateId) {
    console.log(`🗑️ Deleting template ${templateId}`);
    
    const template = treatmentPlans.find(t => t.id === templateId);
    if (!template) {
        showNotification('Template not found', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
        deleteTemplateFromServer(templateId);
    }
}

async function deleteTemplateFromServer(templateId) {
    try {
        const response = await fetch(`/api/treatment-plans/${templateId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showNotification('Template deleted successfully', 'success');
        loadTemplatesView(); // Refresh the templates list
    } catch (error) {
        console.error('❌ Error deleting template:', error);
        showNotification('Error deleting template', 'error');
    }
}

function useTemplate(templateId) {
    console.log(`📧 Using template ${templateId}`);
    
    const template = treatmentPlans.find(t => t.id === templateId);
    if (!template) {
        showNotification('Template not found', 'error');
        return;
    }
    
    showEmailModal(template);
}

function showEmailModal(template) {
    const modalHTML = `
        <div id="emailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Send Template: ${template.name}</h3>
                        <button onclick="closeEmailModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="emailForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Recipients</label>
                            <div class="mt-2 space-y-2">
                                <label class="flex items-center">
                                    <input type="radio" name="recipient_type" value="all" checked class="mr-2">
                                    Send to all patients
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="recipient_type" value="clients" class="mr-2">
                                    Send to clients only
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="recipient_type" value="leads" class="mr-2">
                                    Send to leads only
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="recipient_type" value="custom" class="mr-2">
                                    Select specific patients
                                </label>
                            </div>
                        </div>
                        
                        <div id="customRecipients" class="hidden">
                            <label class="block text-sm font-medium text-gray-700">Select Patients</label>
                            <div class="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                                <div id="patientList"></div>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email Subject</label>
                            <input type="text" name="subject" value="Treatment Plan: ${template.name}" required
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email Message</label>
                            <textarea name="message" rows="6" required
                                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">Dear Patient,

We have a treatment plan that might be perfect for you: ${template.name}

${template.description}

Sessions: ${template.sessions || 'N/A'}
Price: $${template.price || 'Contact us for pricing'}

Please contact us to schedule your appointment.

Best regards,
Posture Perfect Team</textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" onclick="closeEmailModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                                Send Emails
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Load patient list for custom selection
    loadPatientList();
    
    // Handle recipient type change
    document.querySelectorAll('input[name="recipient_type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const customDiv = document.getElementById('customRecipients');
            if (e.target.value === 'custom') {
                customDiv.classList.remove('hidden');
            } else {
                customDiv.classList.add('hidden');
            }
        });
    });
    
    // Handle form submission
    document.getElementById('emailForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await sendTemplateEmails(template, new FormData(e.target));
    });
}

async function loadPatientList() {
    try {
        const response = await fetch('/api/contacts');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const contacts = await response.json();
        
        const patientListDiv = document.getElementById('patientList');
        patientListDiv.innerHTML = contacts.map(contact => `
            <label class="flex items-center py-1">
                <input type="checkbox" name="selected_patients" value="${contact.id}" class="mr-2">
                ${contact.first_name} ${contact.last_name} (${contact.email})
            </label>
        `).join('');
    } catch (error) {
        console.error('❌ Error loading patients:', error);
    }
}

async function sendTemplateEmails(template, formData) {
    try {
        const recipientType = formData.get('recipient_type');
        const subject = formData.get('subject');
        const message = formData.get('message');
        const selectedPatients = formData.getAll('selected_patients');
        
        const emailData = {
            template_id: template.id,
            recipient_type: recipientType,
            selected_patients: selectedPatients,
            subject: subject,
            message: message
        };
        
        const response = await fetch('/api/send-template-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        
        showNotification(`Emails sent successfully to ${result.sent_count} recipients`, 'success');
        closeEmailModal();
    } catch (error) {
        console.error('❌ Error sending emails:', error);
        showNotification('Error sending emails', 'error');
    }
}

async function updateTemplate(templateId, formData) {
    try {
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            duration_weeks: formData.get('duration_weeks'),
            sessions_per_week: formData.get('sessions_per_week'),
            price_per_session: formData.get('price_per_session')
        };
        
        const response = await fetch(`/api/treatment-plans/${templateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showNotification('Template updated successfully', 'success');
        closeEditTemplateModal();
        loadTemplatesView(); // Refresh templates list
    } catch (error) {
        console.error('❌ Error updating template:', error);
        showNotification('Error updating template', 'error');
    }
}

function closeEditTemplateModal() {
    const modal = document.getElementById('editTemplateModal');
    if (modal) modal.remove();
}

function closeEmailModal() {
    const modal = document.getElementById('emailModal');
    if (modal) modal.remove();
}
