class TemplatesManager {
    constructor() {
        this.templates = [];
        this.init();
    }

    async init() {
        await this.loadTemplates();
        this.setupEventListeners();
    }

    async loadTemplates() {
        try {
            const response = await fetch('/api/treatment-plans');
            this.templates = await response.json();
            this.displayTemplates();
        } catch (error) {
            console.error('Error loading templates:', error);
            this.showErrorMessage('Failed to load treatment templates');
        }
    }

    setupEventListeners() {
        document.getElementById('addTemplateBtn').onclick = () => this.showAddModal();
        document.querySelector('.close-template').onclick = () => this.hideModal();
        document.querySelector('.close-edit-template').onclick = () => this.hideEditModal();
        
        document.getElementById('templateForm').onsubmit = (e) => {
            e.preventDefault();
            this.addTemplate();
        };
        
        document.getElementById('editTemplateForm').onsubmit = (e) => {
            e.preventDefault();
            this.updateTemplate();
        };
    }

    showAddModal() {
        document.getElementById('templateModal').style.display = 'block';
    }

    hideModal() {
        document.getElementById('templateModal').style.display = 'none';
        document.getElementById('templateForm').reset();
    }

    hideEditModal() {
        document.getElementById('editTemplateModal').style.display = 'none';
    }

    async addTemplate() {
        const formData = new FormData(document.getElementById('templateForm'));
        const templateData = {
            name: formData.get('name'),
            description: formData.get('description'),
            duration_weeks: parseInt(formData.get('durationWeeks')),
            sessions_per_week: parseInt(formData.get('sessionsPerWeek')),
            price_per_session: parseFloat(formData.get('pricePerSession'))
        };

        try {
            const response = await fetch('/api/treatment-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData)
            });

            if (response.ok) {
                this.hideModal();
                await this.loadTemplates();
                this.showSuccessMessage('Template created successfully!');
            } else {
                const error = await response.json();
                this.showErrorMessage('Error: ' + error.error);
            }
        } catch (error) {
            this.showErrorMessage('Failed to create template');
        }
    }

    async editTemplate(id) {
        try {
            const response = await fetch(`/api/treatment-plans/${id}`);
            const template = await response.json();
            
            document.getElementById('editTemplateId').value = template.id;
            document.getElementById('editName').value = template.name;
            document.getElementById('editDescription').value = template.description;
            document.getElementById('editDurationWeeks').value = template.duration_weeks;
            document.getElementById('editSessionsPerWeek').value = template.sessions_per_week;
            document.getElementById('editPricePerSession').value = template.price_per_session;
            
            document.getElementById('editTemplateModal').style.display = 'block';
        } catch (error) {
            this.showErrorMessage('Error loading template');
        }
    }

    async updateTemplate() {
        const templateId = document.getElementById('editTemplateId').value;
        const formData = new FormData(document.getElementById('editTemplateForm'));
        const templateData = {
            name: formData.get('name'),
            description: formData.get('description'),
            duration_weeks: parseInt(formData.get('durationWeeks')),
            sessions_per_week: parseInt(formData.get('sessionsPerWeek')),
            price_per_session: parseFloat(formData.get('pricePerSession'))
        };

        try {
            const response = await fetch(`/api/treatment-plans/${templateId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData)
            });

            if (response.ok) {
                this.hideEditModal();
                await this.loadTemplates();
                this.showSuccessMessage('Template updated successfully!');
            } else {
                const error = await response.json();
                this.showErrorMessage('Error: ' + error.error);
            }
        } catch (error) {
            this.showErrorMessage('Failed to update template');
        }
    }

    async deleteTemplate(id) {
        if (confirm('Are you sure you want to delete this template?')) {
            try {
                const response = await fetch(`/api/treatment-plans/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadTemplates();
                    this.showSuccessMessage('Template deleted successfully!');
                } else {
                    const error = await response.json();
                    this.showErrorMessage('Error: ' + error.error);
                }
            } catch (error) {
                this.showErrorMessage('Failed to delete template');
            }
        }
    }

    displayTemplates() {
        const container = document.getElementById('templatesContainer');
        
        if (this.templates.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 py-8">No treatment templates found.</div>';
            return;
        }
        
        container.innerHTML = this.templates.map(template => `
            <div class="bg-white rounded-lg shadow border p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${this.escapeHtml(template.name)}</h3>
                        <p class="text-sm text-gray-600 mt-1">${this.escapeHtml(template.description)}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="templatesManager.editTemplate(${template.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700">
                            Edit
                        </button>
                        <button onclick="templatesManager.deleteTemplate(${template.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700">
                            Delete
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Duration:</span>
                        <span class="font-medium ml-1">${template.duration_weeks} weeks</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Sessions/Week:</span>
                        <span class="font-medium ml-1">${template.sessions_per_week}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Price/Session:</span>
                        <span class="font-medium ml-1">$${template.price_per_session}</span>
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="text-sm text-gray-600">
                        <span class="font-medium">Total Cost:</span> 
                        $${(template.duration_weeks * template.sessions_per_week * template.price_per_session).toFixed(2)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const templatesManager = new TemplatesManager();
