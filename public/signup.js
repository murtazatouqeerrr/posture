document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');

    signupForm.onsubmit = function(e) {
        e.preventDefault();
        signup();
    };

    function signup() {
        const name = document.getElementById('name').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!name || !username || !password) {
            showError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        errorMessage.textContent = '';

        fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ name, username, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            // Successful signup - redirect to dashboard
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Signup error:', error);
            showError(error.error || 'Signup failed. Please try again.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
