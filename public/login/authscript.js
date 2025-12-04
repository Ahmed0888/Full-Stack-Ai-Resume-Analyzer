// --------- CONFIG -----------
const API_BASE = "https://ai-resume-analyzer-backend-nine.vercel.app/api";

// --------- DOM CACHE -----------
const $ = (id) => document.getElementById(id);

const emailInput = $("email");
const passwordInput = $("password");
const authStatus = $("authStatus");
const btnLogin = $("btnLogin");

// ----------- TOKEN MANAGEMENT -----------
const setToken = (token) => localStorage.setItem("token", token);
const getToken = () => localStorage.getItem("token");

// ----------- COMMON API WRAPPER -----------
async function apiRequest(endpoint, method, bodyObj) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyObj),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    console.log("API RESPONSE:", res.status, data);

    if (!res.ok || data.success === false) {
      throw new Error(data.message || `Request failed (status ${res.status})`);
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

// ----------- FORM VALIDATOR -----------
function validateInputs() {
  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();

  if (!email) return { valid: false, message: "Email is required" };
  if (!password) return { valid: false, message: "Password is required" };

  return { valid: true };
}

// ----------- LOGIN FUNCTION -----------
async function loginUser() {
  const validation = validateInputs();
  if (!validation.valid) return showMessage(validation.message, true);

  try {
    const data = await apiRequest("auth/login", "POST", {
      email: emailInput.value,
      password: passwordInput.value,
    });

    setToken(data.token);
    if (data.user) {
      localStorage.setItem("userId", data.user.id || data.user._id || "");
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    showMessage("Login successful! Redirecting...");
    setTimeout(() => {
      // ✅ relative path – local aur vercel dono par /dashboard/index.html khul jayega
      window.location.href = "/dashboard/";
    }, 500);
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

// ----------- EVENT LISTENERS -----------
btnLogin?.addEventListener("click", (e) => {
  e.preventDefault();
  loginUser();
});
