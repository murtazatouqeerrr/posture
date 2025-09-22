// Invoices Management - No Authentication
let invoicesData = [];
let contactsData = [];

async function loadInvoicesView() {
    console.log('💰 Loading invoices view...');
    
    try {
        // Fetch invoices and contacts
        const [invoicesResponse, contactsResponse] = await Promise.all([
            fetch('/api/invoices'),
            fetch('/api/contacts')
        ]);

        if (!invoicesResponse.ok) {
            throw new Error(`Failed to fetch invoices: ${invoicesResponse.status}`);
        }
        if (!contactsResponse.ok) {
            throw new Error(`Failed to fetch contacts: ${contactsResponse.status}`);
        }

        invoicesData = await invoicesResponse.json();
        contactsData = await contactsResponse.json();
        
        console.log(`✅ Loaded ${invoicesData.length} invoices and ${contactsData.length} contacts`);

        renderInvoicesView();
    } catch (error) {
        console.error('❌ Invoices loading error:', error);
        document.getElementById('app').innerHTML = `
            <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 class="text-red-800 font-medium">Error Loading Invoices</h3>
                    <p class="text-red-700 mt-2">${error.message}</p>
                    <button onclick="loadInvoicesView()" class="mt-3 bg-red-100 px-3 py-2 rounded text-red-800 hover:bg-red-200">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderInvoicesView() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">Invoices</h2>
                    <p class="text-gray-600">Manage billing and payments</p>
                </div>
                <button id="addInvoiceBtn" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                    Create Invoice
                </button>
            </div>

            <!-- Invoice Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Invoices</p>
                            <p class="text-2xl font-semibold text-gray-900">${invoicesData.length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p class="text-2xl font-semibold text-gray-900">$${invoicesData.filter(i => i.status === 'Paid').reduce((sum, i) => sum + parseFloat(i.amount), 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-yellow-100 rounded-lg">
                            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Pending</p>
                            <p class="text-2xl font-semibold text-gray-900">${invoicesData.filter(i => i.status === 'Sent').length}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-red-100 rounded-lg">
                            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Overdue</p>
                            <p class="text-2xl font-semibold text-gray-900">${invoicesData.filter(i => i.status === 'Overdue').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Invoices Table -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">Recent Invoices</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${invoicesData.length > 0 ? invoicesData.map(invoice => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">#${invoice.id}</div>
                                <div class="text-sm text-gray-500">${formatDate(invoice.created_at)}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">${invoice.first_name} ${invoice.last_name}</div>
                                        <div class="text-sm text-gray-500">${invoice.email}</div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-sm text-gray-900 max-w-xs truncate">${invoice.description}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">$${invoice.amount}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}">
                                            ${invoice.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onclick="viewInvoice(${invoice.id})" class="text-primary hover:text-primary-dark mr-3">View</button>
                                        <button onclick="editInvoice(${invoice.id})" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                        ${invoice.status !== 'Paid' ? `<button onclick="processPayment(${invoice.id})" class="text-green-600 hover:text-green-900">Pay</button>` : ''}
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                                        No invoices found
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Setup event listeners
    const addInvoiceBtn = document.getElementById('addInvoiceBtn');
    if (addInvoiceBtn) {
        addInvoiceBtn.addEventListener('click', showAddInvoiceModal);
    }
}

function showAddInvoiceModal() {
    console.log('➕ Showing add invoice modal');
    
    const modalHTML = `
        <div id="invoiceModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Create New Invoice</h3>
                        <button onclick="closeInvoiceModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="invoiceForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Patient</label>
                            <select name="contact_id" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                <option value="">Select Patient</option>
                                ${contactsData.map(contact => `
                                    <option value="${contact.id}">${contact.first_name} ${contact.last_name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Service Description</label>
                            <textarea name="description" required rows="3" 
                                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Amount ($)</label>
                            <input type="number" name="amount" step="0.01" required 
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Due Date</label>
                            <input type="date" name="due_date" 
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                        </div>
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" onclick="closeInvoiceModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                                Create Invoice
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createInvoice(new FormData(e.target));
    });
}

async function createInvoice(formData) {
    try {
        const data = {
            contact_id: formData.get('contact_id'),
            description: formData.get('description'),
            amount: formData.get('amount'),
            due_date: formData.get('due_date')
        };
        
        const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showNotification('Invoice created successfully', 'success');
        closeInvoiceModal();
        loadInvoicesView();
    } catch (error) {
        console.error('❌ Error creating invoice:', error);
        showNotification('Error creating invoice', 'error');
    }
}

async function viewInvoice(invoiceId) {
    console.log(`👁️ Viewing invoice ${invoiceId}`);
    
    try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const invoice = await response.json();
        
        showInvoiceViewModal(invoice);
    } catch (error) {
        console.error('❌ Error viewing invoice:', error);
        showNotification('Error loading invoice details', 'error');
    }
}

function showInvoiceViewModal(invoice) {
    const modalHTML = `
        <div id="invoiceViewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Invoice #${invoice.id}</h3>
                        <button onclick="closeInvoiceViewModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Patient</label>
                                <p class="mt-1 text-sm text-gray-900">${invoice.first_name} ${invoice.last_name}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Email</label>
                                <p class="mt-1 text-sm text-gray-900">${invoice.email}</p>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Service</label>
                            <p class="mt-1 text-sm text-gray-900">${invoice.description}</p>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Amount</label>
                                <p class="mt-1 text-sm text-gray-900">$${invoice.amount}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <span class="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}">
                                    ${invoice.status}
                                </span>
                            </div>
                        </div>
                        
                        <div class="flex justify-end pt-4">
                            <button onclick="closeInvoiceViewModal()" 
                                    class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function editInvoice(invoiceId) {
    console.log(`✏️ Editing invoice ${invoiceId}`);
    
    try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const invoice = await response.json();
        
        showEditInvoiceModal(invoice);
    } catch (error) {
        console.error('❌ Error loading invoice for edit:', error);
        showNotification('Error loading invoice details', 'error');
    }
}

function showEditInvoiceModal(invoice) {
    const modalHTML = `
        <div id="editInvoiceModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Edit Invoice #${invoice.id}</h3>
                        <button onclick="closeEditInvoiceModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="editInvoiceForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Service Description</label>
                            <textarea name="description" required rows="3" 
                                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">${invoice.description}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Amount ($)</label>
                            <input type="number" name="amount" step="0.01" required value="${invoice.amount}"
                                   class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                <option value="Sent" ${invoice.status === 'Sent' ? 'selected' : ''}>Sent</option>
                                <option value="Paid" ${invoice.status === 'Paid' ? 'selected' : ''}>Paid</option>
                                <option value="Overdue" ${invoice.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                            </select>
                        </div>
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" onclick="closeEditInvoiceModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('editInvoiceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateInvoice(invoice.id, new FormData(e.target));
    });
}

async function updateInvoice(invoiceId, formData) {
    try {
        const data = {
            description: formData.get('description'),
            amount: formData.get('amount'),
            status: formData.get('status')
        };
        
        const response = await fetch(`/api/invoices/${invoiceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        showNotification('Invoice updated successfully', 'success');
        closeEditInvoiceModal();
        loadInvoicesView();
    } catch (error) {
        console.error('❌ Error updating invoice:', error);
        showNotification('Error updating invoice', 'error');
    }
}

async function processPayment(invoiceId) {
    console.log(`💳 Processing payment for invoice ${invoiceId}`);
    
    if (!confirm('Process payment for this invoice?')) return;
    
    try {
        const response = await fetch(`/api/invoices/${invoiceId}/process-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        
        showNotification('Payment processed successfully', 'success');
        loadInvoicesView();
    } catch (error) {
        console.error('❌ Error processing payment:', error);
        showNotification('Error processing payment', 'error');
    }
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    if (modal) modal.remove();
}

function closeInvoiceViewModal() {
    const modal = document.getElementById('invoiceViewModal');
    if (modal) modal.remove();
}

function closeEditInvoiceModal() {
    const modal = document.getElementById('editInvoiceModal');
    if (modal) modal.remove();
}

function getStatusColor(status) {
    switch (status) {
        case 'Paid':
            return 'bg-green-100 text-green-800';
        case 'Sent':
            return 'bg-blue-100 text-blue-800';
        case 'Overdue':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
