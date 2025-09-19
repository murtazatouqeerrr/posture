class InvoiceManager {
    constructor() {
        this.invoices = [];
        this.contacts = [];
        this.init();
    }

    async init() {
        await this.loadContacts();
        await this.loadInvoices();
        this.setupEventListeners();
    }

    async loadContacts() {
        try {
            const response = await fetch('/api/contacts');
            this.contacts = await response.json();
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    }

    async loadInvoices() {
        try {
            const response = await fetch('/api/invoices');
            this.invoices = await response.json();
            this.displayInvoices();
        } catch (error) {
            console.error('Error loading invoices:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('addInvoiceBtn').onclick = () => this.showAddModal();
        document.querySelector('.close-invoice').onclick = () => this.hideModal();
        document.querySelector('.close-edit-invoice').onclick = () => this.hideEditModal();
        
        document.getElementById('invoiceForm').onsubmit = (e) => {
            e.preventDefault();
            this.addInvoice();
        };
        
        document.getElementById('editInvoiceForm').onsubmit = (e) => {
            e.preventDefault();
            this.updateInvoice();
        };
    }

    showAddModal() {
        const modal = document.getElementById('invoiceModal');
        const contactSelect = document.getElementById('contactId');
        
        contactSelect.innerHTML = '<option value="">Select Patient</option>' +
            this.contacts.map(c => `<option value="${c.id}">${c.first_name} ${c.last_name}</option>`).join('');
        
        modal.style.display = 'block';
    }

    hideModal() {
        document.getElementById('invoiceModal').style.display = 'none';
        document.getElementById('invoiceForm').reset();
    }

    hideEditModal() {
        document.getElementById('editInvoiceModal').style.display = 'none';
    }

    async addInvoice() {
        const formData = new FormData(document.getElementById('invoiceForm'));
        const invoiceData = {
            contact_id: formData.get('contactId'),
            service_description: formData.get('serviceDescription'),
            amount: parseFloat(formData.get('amount')),
            invoice_date: formData.get('invoiceDate'),
            due_date: formData.get('dueDate'),
            status: 'Sent'
        };

        try {
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData)
            });

            if (response.ok) {
                this.hideModal();
                await this.loadInvoices();
                this.showSuccessMessage('Invoice created successfully!');
            } else {
                const error = await response.json();
                this.showErrorMessage('Error: ' + error.error);
            }
        } catch (error) {
            this.showErrorMessage('Failed to create invoice');
        }
    }

    async editInvoice(id) {
        try {
            const response = await fetch(`/api/invoices/${id}`);
            const invoice = await response.json();
            
            document.getElementById('editInvoiceId').value = invoice.id;
            document.getElementById('editContactId').innerHTML = 
                this.contacts.map(c => `<option value="${c.id}" ${c.id == invoice.contact_id ? 'selected' : ''}>${c.first_name} ${c.last_name}</option>`).join('');
            document.getElementById('editServiceDescription').value = invoice.service_description;
            document.getElementById('editAmount').value = invoice.amount;
            document.getElementById('editInvoiceDate').value = invoice.invoice_date;
            document.getElementById('editDueDate').value = invoice.due_date;
            document.getElementById('editStatus').value = invoice.status;
            
            document.getElementById('editInvoiceModal').style.display = 'block';
        } catch (error) {
            this.showErrorMessage('Error loading invoice');
        }
    }

    async updateInvoice() {
        const invoiceId = document.getElementById('editInvoiceId').value;
        const formData = new FormData(document.getElementById('editInvoiceForm'));
        const invoiceData = {
            contact_id: formData.get('contactId'),
            service_description: formData.get('serviceDescription'),
            amount: parseFloat(formData.get('amount')),
            invoice_date: formData.get('invoiceDate'),
            due_date: formData.get('dueDate'),
            status: formData.get('status')
        };

        try {
            const response = await fetch(`/api/invoices/${invoiceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData)
            });

            if (response.ok) {
                this.hideEditModal();
                await this.loadInvoices();
                this.showSuccessMessage('Invoice updated successfully!');
            } else {
                const error = await response.json();
                this.showErrorMessage('Error: ' + error.error);
            }
        } catch (error) {
            this.showErrorMessage('Failed to update invoice');
        }
    }

    async deleteInvoice(id) {
        if (confirm('Are you sure you want to delete this invoice?')) {
            try {
                const response = await fetch(`/api/invoices/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadInvoices();
                    this.showSuccessMessage('Invoice deleted successfully!');
                } else {
                    const error = await response.json();
                    this.showErrorMessage('Error: ' + error.error);
                }
            } catch (error) {
                this.showErrorMessage('Failed to delete invoice');
            }
        }
    }

    displayInvoices() {
        const tbody = document.getElementById('invoicesTableBody');
        
        if (this.invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No invoices found.</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.invoices.map(invoice => {
            const contact = this.contacts.find(c => c.id == invoice.contact_id);
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${invoice.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${contact ? contact.first_name + ' ' + contact.last_name : 'Unknown'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.escapeHtml(invoice.service_description)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${invoice.amount}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.invoice_date}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusColor(invoice.status)}">
                            ${invoice.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onclick="invoiceManager.editInvoice(${invoice.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700">
                            Edit
                        </button>
                        <button onclick="invoiceManager.deleteInvoice(${invoice.id})" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getStatusColor(status) {
        switch(status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Sent': return 'bg-blue-100 text-blue-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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

const invoiceManager = new InvoiceManager();
