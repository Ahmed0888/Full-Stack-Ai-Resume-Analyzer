document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const btnLogin = document.getElementById('btnLogin');
    const statusDiv = document.getElementById('authStatus');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            showStatus('Please fill all fields', 'error');
            return;
        }

        btnLogin.disabled = true;
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                showStatus('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/resumes/';
                }, 1500);
            } else {
                showStatus(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            showStatus('Network error. Please try again.', 'error');
        } finally {
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status-message status-${type}`;
        
        if (type === 'success') {
            statusDiv.style.animation = 'slideIn 0.3s ease';
        }
    }
});
