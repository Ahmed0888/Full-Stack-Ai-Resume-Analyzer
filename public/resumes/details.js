let currentResume = null;
const API_BASE = "https://ai-resume-analyzer-backend-nine.vercel.app/api";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Details page loaded");

  protectPage();

  const selectedResume = localStorage.getItem("selectedResume");

  if (!token || !selectedResume) {
    window.location.href = "/resumes/";
    return;
  }

  try {
    currentResume = JSON.parse(selectedResume);
    console.log("✅ Resume loaded:", currentResume._id);
    loadResumeDetails();
  } catch (error) {
    console.error("❌ Parse error:", error);
    showToast("Invalid resume data", "error");
    window.location.href = "/resumes/";
  }

  // Event listeners with null checks
  const backBtn = document.getElementById("backBtn");
  const printBtn = document.getElementById("printBtn");
  const copyImproved = document.getElementById("copyImproved");
  const downloadImprovedBtn = document.getElementById("downloadImproved");

  if (backBtn)
    backBtn.addEventListener(
      "click",
      () => (window.location.href = "/resumes/")
    );
  if (printBtn) printBtn.addEventListener("click", () => window.print());
  if (copyImproved) copyImproved.addEventListener("click", copyImprovedResume);
  if (downloadImprovedBtn)
    downloadImprovedBtn.addEventListener("click", handleDownloadImproved);
});

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}/${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...options,
  };

  try {
    console.log("📡 API Request:", url);
    const response = await fetch(url, config);
    const text = await response.text();
    console.log("📡 Response:", response.status, text.substring(0, 200));

    if (!response.ok) {
      let error = `Error ${response.status}`;
      try {
        const data = JSON.parse(text);
        error = data.message || data.error || error;
      } catch (e) {}
      throw new Error(error);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ API Error:", error);
    throw error;
  }
}

function loadResumeDetails() {
  console.log("🔄 Loading resume details...");

  const loading = document.getElementById("loading");
  const mainContent = document.getElementById("mainContent");

  if (loading) loading.classList.add("hidden");
  if (mainContent) mainContent.classList.remove("hidden");

  // Scores
  const mainScoreEl = document.getElementById("mainScore");
  const aiScoreEl = document.getElementById("aiScore");
  const atsScoreEl = document.getElementById("atsScore");
  const matchScoreEl = document.getElementById("matchScore");

  if (mainScoreEl) mainScoreEl.textContent = currentResume.aiScore || 0;
  if (aiScoreEl) aiScoreEl.textContent = currentResume.aiScore || 0;
  if (atsScoreEl) atsScoreEl.textContent = currentResume.atsScore || 0;
  if (matchScoreEl)
    matchScoreEl.textContent =
      (currentResume.matchPercentage || 0).toFixed(0) + "%";

  // Resume texts
  const originalResumeEl = document.getElementById("originalResume");
  const improvedResumeEl = document.getElementById("improvedResume");

  if (originalResumeEl)
    originalResumeEl.textContent =
      currentResume.originalText || "No original text available";
  if (improvedResumeEl)
    improvedResumeEl.textContent =
      currentResume.aiImprovedText || "No improved text available";

  // Job description
  const jobDescEl = document.getElementById("jobDescription");
  if (jobDescEl) {
    const jobDesc =
      currentResume.jobdescription || "No job description provided";
    jobDescEl.innerHTML = `<p>${jobDesc}</p>`;
  }

  // Missing skills
  const skillsContainer = document.getElementById("missingSkills");
  if (skillsContainer) {
    skillsContainer.innerHTML =
      currentResume.missingSkills && currentResume.missingSkills.length > 0
        ? currentResume.missingSkills
            .map(
              (skill) =>
                `<div class="skill-tag"><i class="fas fa-times-circle"></i> ${skill}</div>`
            )
            .join("")
        : '<p class="text-gray-500">No missing skills detected</p>';
  }

  // File section
  if (currentResume.fileUrl) {
    const fileSection = document.getElementById("fileSection");
    const fileLink = document.getElementById("fileLink");
    if (fileSection) fileSection.style.display = "block";
    if (fileLink) fileLink.href = currentResume.fileUrl;
  }

  renderSuggestions();
  console.log("✅ Details loaded successfully");
}

function renderSuggestions() {
  const container = document.getElementById("suggestionsList");
  if (!container) return;

  if (!currentResume.suggestions || currentResume.suggestions.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 text-center py-8">No suggestions available</p>';
    return;
  }

  container.innerHTML = currentResume.suggestions
    .map(
      (suggestion, index) =>
        `<div class="suggestion-item">
            <h4>${index + 1}. ${suggestion.split(".")[0]}</h4>
            <p>${suggestion}</p>
        </div>`
    )
    .join("");
}

function copyImprovedResume() {
  const text = currentResume.aiImprovedText || "";
  if (!text) {
    showToast("No improved resume available", "error");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => showToast("✅ Improved resume copied to clipboard!", "success"))
    .catch((error) => {
      console.error("Copy failed:", error);
      showToast("❌ Failed to copy", "error");
    });
}

// function downloadImproved() {
//     const text = currentResume.aiImprovedText || '';
//     if (!text) {
//         showToast('No improved resume available', 'error');
//         return;
//     }

//     const blob = new Blob([text], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `improved-resume-${currentResume._id || Date.now()}.txt`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//     showToast('✅ Improved resume downloaded!', 'success');
// }

function handleDownloadImproved() {
  const text = currentResume.aiImprovedText || "";
  if (!text) {
    showToast("No improved resume available", "error");
    return;
  }

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `improved-resume-${currentResume._id || Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("✅ Improved resume downloaded!", "success");
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        padding: 1rem 1.5rem; background: ${
          type === "success" ? "#10b981" : "#ef4444"
        };
        color: white; border-radius: 8px; z-index: 9999; font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add("show"), 100);

  // Animate out
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.clear();
    window.location.href = "/login/";
  }
}

function protectPage() {
  if (!token) {
    showToast("Please login first", true);
    window.location.href = "/login/";
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.id) {
      throw new Error("Invalid token");
    }
  } catch (error) {
    console.error("❌ Invalid token:", error);
    localStorage.removeItem("token");
    showToast("Session expired. Please login again", true);
    window.location.href = "/login/";
    return false;
  }
  return true;
}

console.log("✅ Details script fully loaded & protected");
