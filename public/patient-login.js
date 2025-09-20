document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('patient-login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const loginData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/patient/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                window.location.href = 'patient-portal.html';
            } else {
                const error = await response.json();
                alert(`Login failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    });
});
