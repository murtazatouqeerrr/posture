document.addEventListener('DOMContentLoaded', function() {
    const sendTemplateModal = document.getElementById('sendTemplateModal');
    const closeModal = document.querySelector('.close');
    const sendTemplateForm = document.getElementById('sendTemplateForm');
    const templatesGrid = document.getElementById('templatesGrid');
    const contactSelect = document.getElementById('templateContactSelect');

    loadTemplates();
    loadContacts();

    closeModal.onclick = () => sendTemplateModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === sendTemplateModal) {
            sendTemplateModal.style.display = 'none';
        }
    };

    sendTemplateForm.onsubmit = function(e) {
        e.preventDefault();
        sendTemplate();
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

    function loadTemplates() {
        fetch('/api/treatment-plans')
            .then(response => response.json())
            .then(templates => {
                displayTemplates(templates);
            });
    }

    function displayTemplates(templates) {
        templatesGrid.innerHTML = '';
        templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <h3>${template.name}</h3>
                <p>${template.description}</p>
                <div class="template-duration">${template.duration}</div>
                <div class="template-price">$${template.price}</div>
                <button class="btn-primary" onclick="openSendModal(${template.id})">Send to Contact</button>
            `;
            templatesGrid.appendChild(card);
        });
    }

    window.openSendModal = function(templateId) {
        fetch(`/api/treatment-plans/${templateId}`)
            .then(response => response.json())
            .then(template => {
                document.getElementById('templateId').value = template.id;
                document.getElementById('templatePreview').textContent = 
                    `${template.name}\n\n${template.description}\n\nDuration: ${template.duration}\nPrice: $${template.price}\n\nDetails:\n${template.template_content}`;
                sendTemplateModal.style.display = 'block';
            });
    };

    function sendTemplate() {
        const templateId = document.getElementById('templateId').value;
        const contactId = document.getElementById('templateContactSelect').value;
        
        // In a real application, this would send an email or create a task
        alert(`Treatment plan sent to contact! (Template ID: ${templateId}, Contact ID: ${contactId})`);
        sendTemplateModal.style.display = 'none';
    }
});
