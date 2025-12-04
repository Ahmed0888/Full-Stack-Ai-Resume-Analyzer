document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Register page loaded');
    
    // DOM Elements
    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const authStatus = document.getElementById('authStatus');
    const btnRegister = document.getElementById('btnRegister');
    
    // Backend API base URL - FIXED (use full URL)
    const API_BASE = "https://ai-resume-analyzer-backend-nine.vercel.app/api";
    
    // Token management
    const setToken = (token) => localStorage.setItem('token', token);
    
    // Show status message
    function showMessage(message, isError = false) {
        console.log('Status:', message, isError ? 'ERROR' : 'SUCCESS');
        if (authStatus) {
            authStatus.textContent = message;
            authStatus.className = `status-message ${isError ? 'error' : 'success'}`;
        }
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'}; color: white;
            border-radius: 12px; font-weight: 600; z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateX(400px); transition: all 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Validate form inputs
    function validateForm() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!name) return { valid: false, message: 'Name is required' };
        if (!email || !email.includes('@')) return { valid: false, message: 'Valid email is required' };
        if (password.length < 6) return { valid: false, message: 'Password must be 6+ characters' };
        
        return { valid: true };
    }
    
    // API Request using full backend URL
    async function apiRequest(endpoint, data) {
        try {
            const url = `${API_BASE}/auth/${endpoint}`;
            console.log('📡 Sending to:', url, data);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const responseText = await response.text();
            console.log('📡 RAW Response:', responseText.substring(0, 200));
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                let errorMsg = `Server error: ${response.status}`;
                try {
                    const result = JSON.parse(responseText);
                    errorMsg = result.message || errorMsg;
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                }
                throw new Error(errorMsg);
            }
            
            return JSON.parse(responseText);
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }
    
    // Register form submit handler
    async function handleRegister(e) {
        e.preventDefault();
        console.log('🎯 REGISTER BUTTON CLICKED!');
        
        btnRegister.disabled = true;
        btnRegister.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        
        const validation = validateForm();
        if (!validation.valid) {
            showMessage(validation.message, true);
            showToast('❌ ' + validation.message, 'error');
            btnRegister.disabled = false;
            btnRegister.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            return;
        }
        
        try {
            const result = await apiRequest('register', {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value.trim()
            });
            
            setToken(result.token);
            showMessage('✅ Account created! Redirecting...', false);
            showToast('✅ Registration successful!', 'success');
            
            setTimeout(() => {
                window.location.href = '/login/';
            }, 1500);
        } catch (error) {
            showMessage(error.message, true);
            showToast('❌ ' + error.message, 'error');
        } finally {
            btnRegister.disabled = false;
            btnRegister.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    }
    
    // Attach event listener to form
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('✅ Form submit listener attached');
    } else {
        console.error('❌ registerForm not found!');
    }
});
