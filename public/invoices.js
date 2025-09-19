document.addEventListener('DOMContentLoaded', function() {
    loadInvoices();
    
    const addInvoiceBtn = document.getElementById('addInvoiceBtn');
    if (addInvoiceBtn) {
        addInvoiceBtn.onclick = () => alert('Add invoice functionality - Demo');
    }
});

async function loadInvoices() {
    try {
        const response = await fetch('/api/invoices');
        const invoices = await response.json();
        displayInvoices(invoices);
    } catch (error) {
        console.error('Error loading invoices:', error);
        document.getElementById('invoicesTableBody').innerHTML = 
            '<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error loading invoices</td></tr>';
    }
}

function displayInvoices(invoices) {
    const tbody = document.getElementById('invoicesTableBody');
    
    if (invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No invoices found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = invoices.map(invoice => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${invoice.contact_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${invoice.amount.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}">
                    ${invoice.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(invoice.due_date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.services_rendered}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="viewInvoice(${invoice.id})" class="text-blue-600 hover:text-blue-900">View</button>
                <button onclick="editInvoice(${invoice.id})" class="text-yellow-600 hover:text-yellow-900">Edit</button>
                <button onclick="deleteInvoice(${invoice.id})" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    switch(status) {
        case 'Paid': return 'bg-green-100 text-green-800';
        case 'Sent': return 'bg-blue-100 text-blue-800';
        case 'Overdue': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function viewInvoice(id) {
    alert(`Viewing invoice ${id}`);
}

function editInvoice(id) {
    alert(`Editing invoice ${id}`);
}

function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        alert(`Deleting invoice ${id}`);
    }
}
