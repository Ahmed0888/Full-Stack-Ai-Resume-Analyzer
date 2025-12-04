function protectPage() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "/login/";
  }
}
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/login/';
    }
}