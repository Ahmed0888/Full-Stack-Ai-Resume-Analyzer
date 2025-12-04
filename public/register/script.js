// --------- DOM CACHE -----------
const $ = (id) => document.getElementById(id);

const nameInput = $("name");
const emailInput = $("email");
const passwordInput = $("password");
const authStatus = $("authStatus");
const registerForm = $("registerForm");  // ✅ FORM SELECT KARO

// ----------- TOKEN MANAGEMENT -----------
const setToken = (token) => localStorage.setItem("token", token);
const getToken = () => localStorage.getItem("token");

// ----------- COMMON API WRAPPER -----------
async function apiRequest(endpoint, method, bodyObj) {
  try {
    const res = await fetch(`/api/auth/${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyObj)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");

    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

// ----------- FORM VALIDATOR -----------
function validateInputs({ nameRequired = false } = {}) {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const name = nameInput?.value?.trim();

  if (nameRequired && !name) return { valid: false, message: "Name is required" };
  if (!email) return { valid: false, message: "Email is required" };
  if (!password || password.length < 6) return { valid: false, message: "Password must be at least 6 characters" };  // ✅ IMPROVED

  return { valid: true };
}

// ----------- REGISTER FUNCTION -----------
async function registerUser(e) {  // ✅ EVENT PARAMETER
  e.preventDefault();  // ✅ FORM SUBMIT BLOCK
  
  const validation = validateInputs({ nameRequired: true });
  if (!validation.valid) return showMessage(validation.message, true);

  try {
    const data = await apiRequest("register", "POST", {
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
    });

    setToken(data.token);
    showMessage("Registration successful! Redirecting...", false);
    setTimeout(() => {
      window.location.href = "/login/";
    }, 1500);

  } catch (err) {
    showMessage(err.message, true);
  }
}

// ----------- UI HELPER -----------
function showMessage(msg, isError = false) {
  if (authStatus) {
    authStatus.textContent = msg;  // ✅ textContent use karo
    authStatus.className = `status-message ${isError ? 'error' : 'success'}`;
  } else {
    alert(msg);
  }
}

// ----------- EVENT LISTENER ✅ FIXED --------
registerForm?.addEventListener("submit", registerUser);  // FORM SUBMIT PE LAGAO
