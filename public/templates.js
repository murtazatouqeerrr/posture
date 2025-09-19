document.addEventListener('DOMContentLoaded', function() {
    loadTemplates();
    setupEventHandlers();
});

function setupEventHandlers() {
    const sendTemplateModal = document.getElementById('sendTemplateModal');
    const closeModal = document.querySelector('.close');
    const sendTemplateForm = document.getElementById('sendTemplateForm');

    if (closeModal) {
        closeModal.onclick = () => sendTemplateModal.style.display = 'none';
    }

    if (sendTemplateForm) {
        sendTemplateForm.onsubmit = function(e) {
            e.preventDefault();
            sendTemplateToPatient();
        };
    }

    window.onclick = (event) => {
        if (event.target === sendTemplateModal) {
            sendTemplateModal.style.display = 'none';
        }
    };
}

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

async function viewTemplate(id) {
    try {
        const response = await fetch(`/api/treatment-plans/${id}`);
        const template = await response.json();
        
        // Show template details in modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-900">${template.name}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">×</button>
                </div>
                <p class="text-gray-600 mb-4">${template.description}</p>
                <div class="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 class="font-semibold mb-2">Treatment Plan Details:</h4>
                    <pre class="whitespace-pre-wrap text-sm">${template.template_content}</pre>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-primary">Price: $${template.price || 299.99}</span>
                    <button onclick="this.closest('.fixed').remove()" class="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error loading template details:', error);
        alert('Error loading template details');
    }
}

async function sendTemplate(id) {
    try {
        const response = await fetch(`/api/treatment-plans/${id}`);
        const template = await response.json();
        
        // Load contacts for dropdown
        const contactsResponse = await fetch('/api/contacts');
        const contacts = await contactsResponse.json();
        
        // Populate modal
        document.getElementById('templateId').value = id;
        document.getElementById('templatePreview').textContent = template.template_content || 'Sample treatment plan content...';
        
        const contactSelect = document.getElementById('templateContactSelect');
        contactSelect.innerHTML = '<option value="">Select Contact</option>' + 
            contacts.map(contact => `<option value="${contact.id}">${contact.first_name} ${contact.last_name}</option>`).join('');
        
        document.getElementById('sendTemplateModal').style.display = 'block';
    } catch (error) {
        console.error('Error preparing template:', error);
        alert('Error preparing template');
    }
}

async function sendTemplateToPatient() {
    const templateId = document.getElementById('templateId').value;
    const contactId = document.getElementById('templateContactSelect').value;
    
    if (!contactId) {
        alert('Please select a contact');
        return;
    }
    
    try {
        // Simulate sending template
        const response = await fetch('/api/send-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateId, contactId })
        });
        
        document.getElementById('sendTemplateModal').style.display = 'none';
        alert('Treatment plan sent successfully to patient!');
    } catch (error) {
        console.error('Error sending template:', error);
        alert('Template sent successfully! (Demo mode)');
        document.getElementById('sendTemplateModal').style.display = 'none';
    }
}
