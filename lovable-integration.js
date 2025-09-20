// JavaScript code snippet for Lovable website form submission
// Add this to your Thank You page or form submission handler

function submitToCRM(formData) {
    const crmData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        primary_complaint: formData.message
    };

    fetch('https://our-crm-domain.com/api/contacts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(crmData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success: Contact added to CRM', data);
    })
    .catch(error => {
        console.error('Error submitting to CRM:', error);
    });
}

// Example usage - call this function after form submission
// submitToCRM({
//     first_name: 'John',
//     last_name: 'Doe',
//     email: 'john@example.com',
//     phone: '123-456-7890',
//     message: 'Back pain issues'
// });
