// Invoices Management - Static HTML Version
let invoicesData = [];
let contactsData = [];

// Load invoices when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadInvoices();
});

async function loadInvoices() {
    console.log('💰 Loading invoices...');
    
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

        renderInvoicesTable();
    } catch (error) {
        console.error('❌ Invoices loading error:', error);
        const tableBody = document.getElementById('invoicesTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center">
                        <div class="text-red-600">
                            <p class="font-medium">Error Loading Invoices</p>
                            <p class="text-sm mt-1">${error.message}</p>
                            <button onclick="loadInvoices()" class="mt-2 bg-red-100 px-3 py-2 rounded text-red-800 hover:bg-red-200">
                                Retry
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

function renderInvoicesTable() {
    const tableBody = document.getElementById('invoicesTableBody');
    if (!tableBody) {
        console.error('❌ Table body not found');
        return;
    }

    if (invoicesData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    No invoices found
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = invoicesData.map(invoice => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${invoice.first_name || 'N/A'} ${invoice.last_name || ''}</div>
                        <div class="text-sm text-gray-500">${invoice.email || 'No email'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">$${parseFloat(invoice.amount || 0).toFixed(2)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}">
                    ${invoice.status || 'Unknown'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatDate(invoice.due_date)}
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">${invoice.service_description || 'No description'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewInvoice(${invoice.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                <button onclick="editInvoice(${invoice.id})" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                ${invoice.status !== 'Paid' ? `<button onclick="processPayment(${invoice.id})" class="text-green-600 hover:text-green-900">Pay</button>` : ''}
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    switch (status) {
        case 'Paid':
            return 'bg-green-100 text-green-800';
        case 'Sent':
            return 'bg-yellow-100 text-yellow-800';
        case 'Overdue':
            return 'bg-red-100 text-red-800';
        case 'Draft':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'No date';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

// Placeholder functions for actions
function viewInvoice(invoiceId) {
    console.log(`👁️ Viewing invoice ${invoiceId}`);
    alert(`View invoice ${invoiceId} - Feature coming soon!`);
}

function editInvoice(invoiceId) {
    console.log(`✏️ Editing invoice ${invoiceId}`);
    alert(`Edit invoice ${invoiceId} - Feature coming soon!`);
}

function processPayment(invoiceId) {
    console.log(`💳 Processing payment for invoice ${invoiceId}`);
    alert(`Process payment for invoice ${invoiceId} - Feature coming soon!`);
}