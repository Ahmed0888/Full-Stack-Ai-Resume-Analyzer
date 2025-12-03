// // // public/js/auth.js
// // const btnRegister = document.getElementById("btnRegister");
// // const btnLogin = document.getElementById("btnLogin");
// // const authStatus = document.getElementById("authStatus");
// // const nameInput = document.getElementById("name");
// // const emailInput = document.getElementById("email");
// // const passwordInput = document.getElementById("password");

// // function setToken(token) { localStorage.setItem("token", token); }
// // function getToken() { return localStorage.getItem("token"); }

// // btnRegister.addEventListener("click", async () => {
// //   try {
// //     const res = await fetch("/api/auth/register", {
// //       method: "POST", headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ name: nameInput.value, email: emailInput.value, password: passwordInput.value })
// //     });
// //     const data = await res.json();
// //     if (data.token) { setToken(data.token); authStatus.innerText = "Registered & logged in"; }
// //     else authStatus.innerText = data.message || "Register failed";
// //   } catch (err) { authStatus.innerText = "Error"; console.error(err); }
// // });

// // btnLogin.addEventListener("click", async () => {
// //   try {
// //     const res = await fetch("/api/auth/login", {
// //       method: "POST", headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
// //     });
// //     const data = await res.json();
// //     if (data.token) { setToken(data.token); authStatus.innerText = "Logged in"; }
// //     else authStatus.innerText = data.message || "Login failed";
// //   } catch (err) { authStatus.innerText = "Error"; console.error(err); }
// // });

// // // public/js/auth.js
// // function setToken(token) {
// //   localStorage.setItem("token", token);
// // }
// // function getToken() {
// //   return localStorage.getItem("token");
// // }

// // // ================== REGISTER ==================
// // async function registerUser() {
// //   const name = document.getElementById("name").value;
// //   const email = document.getElementById("email").value;
// //   const password = document.getElementById("password").value;

// //   const res = await fetch("/api/auth/register", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({ name, email, password })
// //   });

// //   const data = await res.json();

// //   if (data.token) {
// //     setToken(data.token);
// //     window.location.href = "../analyzer.html";  // Redirect after login
// //   } else {
// //     alert(data.message || "Register failed");
// //   }
// // }

// // // ================== LOGIN ==================
// // async function loginUser() {
// //   const email = document.getElementById("email").value;
// //   const password = document.getElementById("password").value;

// //   const res = await fetch("/api/auth/login", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({ email, password })
// //   });

// //   const data = await res.json();

// //   if (data.token) {
// //     setToken(data.token);
// //     window.location.href = "../analyzer.html"; // Redirect after login
// //   } else {
// //     alert(data.message || "Login failed");
// //   }
// // }



// // ==========================
// // public/js/auth.js (Improved)
// // ==========================

//     // ----------- DOM CACHE -----------
//     const $ = (id) => document.getElementById(id);

//     const nameInput = $("name");
//     const emailInput = $("email");
//     const passwordInput = $("password");
//     const authStatus = $("authStatus");
//     const btnLogin = $("btnLogin");
//     const btnRegister = $("btnRegister");

//     // ----------- TOKEN MANAGEMENT -----------
//     const setToken = (token) => localStorage.setItem("token", token);
//     const getToken = () => localStorage.getItem("token");

//     // ----------- COMMON API WRAPPER -----------
//     async function apiRequest(endpoint, method, bodyObj) {
//     try {
//         const res = await fetch(`/api/auth/${endpoint}`, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(bodyObj)
//         });

//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Something went wrong");

//         return data;
//     } catch (err) {
//         throw new Error(err.message || "Network error");
//     }
//     }

//     // ----------- FORM VALIDATOR -----------
//     function validateInputs({ nameRequired = false } = {}) {
//     const email = emailInput.value.trim();
//     const password = passwordInput.value.trim();
//     const name = nameInput?.value?.trim();

//     if (nameRequired && !name) return { valid: false, message: "Name is required" };
//     if (!email) return { valid: false, message: "Email is required" };
//     if (!password) return { valid: false, message: "Password is required" };

//     return { valid: true };
//     }

//     // ----------- REGISTER FUNCTION -----------
//     async function registerUser() {
//     const validation = validateInputs({ nameRequired: true });
//     if (!validation.valid) return showMessage(validation.message, true);

//     try {
//         const data = await apiRequest("register", "POST", {
//         name: nameInput.value,
//         email: emailInput.value,
//         password: passwordInput.value,
//         });

//         setToken(data.token);
//         showMessage("Registration successful! Redirecting...");
//         alert("Registration successful! Please login.");
//         redirectToLogin();

//     } catch (err) {
//         showMessage(err.message, true);
//     }
//     }

//     // ----------- LOGIN FUNCTION -----------
//     async function loginUser() {
//     const validation = validateInputs();
//     if (!validation.valid) return showMessage(validation.message, true);

//     try {
//         const data = await apiRequest("login", "POST", {
//         email: emailInput.value,
//         password: passwordInput.value,
//         });

//         setToken(data.token);
//         showMessage("Login successful! Redirecting...");
//         redirectToDashboard();

//     } catch (err) {
//         showMessage(err.message, true);
//     }
//     }

//     // ----------- UI HELPER -----------
//     function showMessage(msg, isError = false) {
//     if (authStatus) {
//         authStatus.innerText = msg;
//         authStatus.style.color = isError ? "red" : "green";
//     } else {
//         alert(msg);
//     }
//     }

//     // ----------- REDIRECT -----------
//     function redirectToDashboard() {
//     setTimeout(() => {
//         window.location.href = "../direct.html";
//     }, 500);
//     }

//     function redirectToLogin() {
//     setTimeout(() => {
//         window.location.href = "../login.html";
//     }, 500);
//     }
//     // ----------- EVENT LISTENERS -----------
//     btnRegister?.addEventListener("click", registerUser);
//     btnLogin?.addEventListener("click", loginUser);



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
// async function registerUser() {
//   const validation = validateInputs({ nameRequired: true });
//   if (!validation.valid) return showMessage(validation.message, true);

//   try {
//     const data = await apiRequest("register", "POST", {
//       name: nameInput.value,
//       email: emailInput.value,
//       password: passwordInput.value,
//     });

//     setToken(data.token);
//     showMessage("Registration successful! Redirecting...");
//     alert("Registration successful! Please login.");
//     redirectToLogin();

//   } catch (err) {
//     showMessage(err.message, true);
//   }
// }


async function registerUser() {
  const validation = validateInputs({ nameRequired: true });
  if (!validation.valid) return showMessage(validation.message, true);

  btnRegister.disabled = true;
  btnRegister.textContent = "Creating account...";

  try {
    const data = await apiRequest("register", "POST", {
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
    });

    setToken(data.token);
    showMessage("Registration successful! Redirecting...");
    redirectToLogin();
  } catch (err) {
    showMessage(err.message, true);
  } finally {
    btnRegister.disabled = false;
    btnRegister.textContent = "Register";
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
    window.location.href = "/dashboard/";   // ya "/dashboard/index.html"
  }, 500);
}

function redirectToLogin() {
  setTimeout(() => {
    window.location.href = "/login/";       // tumhare link se match karega
  }, 500);
}


function showMessage(msg, isError = false) {
  if (!authStatus) return alert(msg);

  authStatus.innerText = msg;
  authStatus.classList.remove("error", "success");
  authStatus.classList.add(isError ? "error" : "success");
}


// ----------- EVENT LISTENERS -----------
btnRegister?.addEventListener("click", registerUser);
btnLogin?.addEventListener("click", loginUser);
