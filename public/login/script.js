document.addEventListener('DOMContentLoaded', function () {
  // ✅ Live backend base URL
  const API_BASE = "https://ai-resume-analyzer-backend-nine.vercel.app/api";

  const form = document.getElementById('loginForm');
  const btnLogin = document.getElementById('btnLogin');
  const statusDiv = document.getElementById('authStatus');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (!form) {
    console.error("loginForm not found in DOM");
    return;
  }

  form.addEventListener('submit', async function (e) {
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
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log('LOGIN RESPONSE:', response.status, data);

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        showStatus('Login successful! Redirecting...', 'success');

        setTimeout(() => {
          // ✅ local dev + vercel dono ke liye safe relative path
          window.location.href = '/dashboard/';
          // agar locally sirf /public se serve ho raha ho to:
          // window.location.href = '/public/dashboard/index.html';
        }, 1500);
      } else {
        showStatus(
          data.message || `Login failed (status ${response.status})`,
          'error'
        );
      }
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      showStatus('Network error. Please try again.', 'error');
    } finally {
      btnLogin.disabled = false;
      btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
  });

  function showStatus(message, type) {
    if (!statusDiv) return;
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;

    if (type === 'success') {
      statusDiv.style.animation = 'slideIn 0.3s ease';
    } else {
      statusDiv.style.animation = '';
    }
  }
});
