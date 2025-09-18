document.addEventListener('DOMContentLoaded', function() {
    const addInvoiceBtn = document.getElementById('addInvoiceBtn');
    const addInvoiceModal = document.getElementById('addInvoiceModal');
    const closeModal = document.querySelector('.close');
    const addInvoiceForm = document.getElementById('addInvoiceForm');
    const invoicesTableBody = document.getElementById('invoicesTableBody');
    const contactSelect = document.getElementById('invoiceContactSelect');

    loadContacts();
    loadInvoices();

    addInvoiceBtn.onclick = () => addInvoiceModal.style.display = 'block';
    closeModal.onclick = () => addInvoiceModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === addInvoiceModal) {
            addInvoiceModal.style.display = 'none';
        }
    };

    addInvoiceForm.onsubmit = function(e) {
        e.preventDefault();
        addInvoice();
    };

    function loadContacts() {
        fetch('/api/contacts')
            .then(response => response.json())
            .then(contacts => {
                contactSelect.innerHTML = '<option value="">Select Contact</option>';
                contacts.forEach(contact => {
                    const option = document.createElement('option');
                    option.value = contact.id;
                    option.textContent = `${contact.first_name} ${contact.last_name}`;
                    contactSelect.appendChild(option);
                });
            });
    }

    function loadInvoices() {
        fetch('/api/invoices')
            .then(response => response.json())
            .then(invoices => {
                displayInvoices(invoices);
            });
    }

    function displayInvoices(invoices) {
        invoicesTableBody.innerHTML = '';
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            const contactName = invoice.first_name && invoice.last_name 
                ? `${invoice.first_name} ${invoice.last_name}` 
                : 'N/A';
            
            row.innerHTML = `
                <td>${contactName}</td>
                <td>$${invoice.amount}</td>
                <td>${invoice.status}</td>
                <td>${invoice.due_date}</td>
                <td>${invoice.services_rendered}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="markPaid(${invoice.id})">Mark Paid</button>
                </td>
            `;
            invoicesTableBody.appendChild(row);
        });
    }

    function addInvoice() {
        const invoiceData = {
            contact_id: document.getElementById('invoiceContactSelect').value,
            amount: document.getElementById('amount').value,
            due_date: document.getElementById('dueDate').value,
            services_rendered: document.getElementById('servicesRendered').value
        };

        fetch('/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                addInvoiceModal.style.display = 'none';
                addInvoiceForm.reset();
                loadInvoices();
            }
        });
    }

    window.markPaid = function(id) {
        fetch(`/api/invoices/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'Paid' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                loadInvoices();
            }
        });
    };
});
