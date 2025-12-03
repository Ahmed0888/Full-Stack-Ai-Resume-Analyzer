// public/js/analyzer.js
const btnUpload = document.getElementById("btnUpload");
const fileInput = document.getElementById("fileInput");
const jobDesc = document.getElementById("jobDesc");
const resultDiv = document.getElementById("result");
const loading = document.getElementById("loading");

function getToken() { return localStorage.getItem("token"); }

btnUpload.addEventListener("click", async () => {
  if (!fileInput.files[0]) return alert("Select PDF");
  const token = getToken();
  if (!token) return alert("Please login first (open index.html)");

  const fd = new FormData();
  fd.append("file", fileInput.files[0]);
  fd.append("jobDesc", jobDesc.value || "");

  loading.style.display = "inline";
  resultDiv.innerHTML = "";

  try {
    const res = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: fd
    });
    const data = await res.json();
    loading.style.display = "none";
    if (!data.success) { resultDiv.innerHTML = `<div class="card"><pre>${JSON.stringify(data)}</pre></div>`; return; }

    const ai = data.analysis;
    // If AI returned object under different keys, it's okay as we saved structured aiObj in server
    resultDiv.innerHTML = `
      <div class="card"><h4>Resume Score</h4><p>${ai.resumeScore || "N/A"}</p></div>
      <div class="card"><h4>ATS Score</h4><p>${ai.atsScore || "N/A"}</p></div>
      <div class="card"><h4>Match %</h4><p>${ai.matchPercentage || "N/A"}%</p></div>
      <div class="card"><h4>Missing Skills</h4><ul>${(ai.missingSkills || []).map(s=>`<li>${s}</li>`).join("")}</ul></div>
      <div class="card"><h4>Suggestions</h4><ul>${(ai.suggestions || []).map(s=>`<li>${s}</li>`).join("")}</ul></div>
      <div class="card" ><h4>Improved Resume</h4><pre>${ai.improvedText || ai.improvedText || ""}</pre></div>
      <div class="card"><h4>Stored File</h4><p>${data.saved?.fileUrl ? `<a href="${data.saved.fileUrl}" target="_blank">Open file</a>` : "File not uploaded"}</p></div>
    `;
  } catch (err) {
    loading.style.display = "none";
    console.error(err);
    alert("Upload failed. Check console.");
  }
});
