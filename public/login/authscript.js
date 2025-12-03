// --------- DOM CACHE -----------
const $ = (id) => document.getElementById(id);

const nameInput = $("name");
const emailInput = $("email");
const passwordInput = $("password");
const authStatus = $("authStatus");
const btnLogin = $("btnLogin");
const btnRegister = $("btnRegister");

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
  if (!password) return { valid: false, message: "Password is required" };

  return { valid: true };
}

// ----------- REGISTER FUNCTION -----------
async function registerUser() {
  const validation = validateInputs({ nameRequired: true });
  if (!validation.valid) return showMessage(validation.message, true);

  try {
    const data = await apiRequest("register", "POST", {
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
    });

    setToken(data.token);
    showMessage("Registration successful! Redirecting...");
    alert("Registration successful! Please login.");
    redirectToLogin();

  } catch (err) {
    showMessage(err.message, true);
  }
}

// ----------- LOGIN FUNCTION -----------
async function loginUser() {
  const validation = validateInputs();
  if (!validation.valid) return showMessage(validation.message, true);

  try {
    const data = await apiRequest("login", "POST", {
      email: emailInput.value,
      password: passwordInput.value,
    });

    setToken(data.token);
    showMessage("Login successful! Redirecting...");
    redirectToDashboard();

  } catch (err) {
    showMessage(err.message, true);
  }
}

// ----------- UI HELPER -----------
function showMessage(msg, isError = false) {
  if (authStatus) {
    authStatus.innerText = msg;
    authStatus.style.color = isError ? "red" : "green";
  } else {
    alert(msg);
  }
}

// ----------- REDIRECT -----------
function redirectToDashboard() {
  setTimeout(() => {
    window.location.href = "../dashboard/index.html";
  }, 500);
}

function redirectToLogin() {
  setTimeout(() => {
    window.location.href = "../login.html";
  }, 500);
}

// ----------- EVENT LISTENERS -----------
btnRegister?.addEventListener("click", registerUser);
btnLogin?.addEventListener("click", loginUser);
