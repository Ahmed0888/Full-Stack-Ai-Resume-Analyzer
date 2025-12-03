function protectPage() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "/login";
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
