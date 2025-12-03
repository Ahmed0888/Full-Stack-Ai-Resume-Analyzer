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

//   try {
//     const res = await fetch("/api/resume/analyze", {
//       method: "POST",
//       headers: { Authorization: "Bearer " + token },
//       body: fd
//     });
//     const data = await res.json();
//     loading.style.display = "none";
//     if (!data.success) { 
//       resultDiv.innerHTML = `<div class="card"><pre>${JSON.stringify(data)}</pre></div>`; 
//       return; 
//     }

//     const ai = data.analysis;
//     resultDiv.innerHTML = `
//       <div class="card"><h4>Resume Score</h4><p>${ai.resumeScore || "N/A"}</p></div>
//       <div class="card"><h4>ATS Score</h4><p>${ai.atsScore || "N/A"}</p></div>
//       <div class="card"><h4>Match %</h4><p>${ai.matchPercentage || "N/A"}%</p></div>
//       <div class="card"><h4>Missing Skills</h4><ul>${(ai.missingSkills || []).map(s=>`<li>${s}</li>`).join("")}</ul></div>
//       <div class="card"><h4>Suggestions</h4><ul>${(ai.suggestions || []).map(s=>`<li>${s}</li>`).join("")}</ul></div>
//       <div class="card" ><h4>Improved Resume</h4><pre>${ai.improvedText || ai.improvedText || ""}</pre></div>
//       <div class="card"><h4>Stored File</h4><p>${data.saved?.fileUrl ? `<a href="${data.saved.fileUrl}" target="_blank">Open file</a>` : "File not uploaded"}</p></div>
//     `;
//   } catch (err) {
//     loading.style.display = "none";
//     console.error(err);
//     alert("Upload failed. Check console.");
//   }


  try {
    const res = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: fd
    });
    const data = await res.json();
    loading.style.display = "none";

    if (!data.success) {
      resultDiv.innerHTML = `
        <div class="result-card error">
          <h3>Analysis Failed</h3>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>`;
      return;
    }

    const ai = data.analysis || {};

    const missingSkills = (ai.missingSkills || []).map(s => `<li>${s}</li>`).join("") || "<li>No major missing skills</li>";
    const suggestions = (ai.suggestions || []).map(s => `<li>${s}</li>`).join("") || "<li>No extra suggestions</li>";

    resultDiv.innerHTML = `
      <section class="results-grid">
        <div class="result-card score main-score-card">
          <h4>Overall Resume Score</h4>
          <div class="score-value">${ai.resumeScore || "N/A"}</div>
          <p class="score-label">Out of 100</p>
        </div>

        <div class="result-card score">
          <h4>ATS Score</h4>
          <div class="score-value small">${ai.atsScore || "N/A"}</div>
          <p class="score-label">ATS optimization level</p>
        </div>

        <div class="result-card score">
          <h4>Job Match</h4>
          <div class="score-value small">${ai.matchPercentage != null ? ai.matchPercentage + "%" : "N/A"}</div>
          <p class="score-label">Based on job description</p>
        </div>
      </section>

      <section class="results-grid">
        <div class="result-card list-card">
          <h4>Missing / Weak Skills</h4>
          <ul>${missingSkills}</ul>
        </div>

        <div class="result-card list-card">
          <h4>AI Suggestions</h4>
          <ul>${suggestions}</ul>
        </div>
      </section>

      <section class="result-card improved-card">
        <div class="improved-header">
          <div>
            <h4>AI-Improved Resume</h4>
            <p class="score-label">Copy and refine before applying</p>
          </div>
          <button id="btnCopyImproved" class="btn-copy-improved">Copy Text</button>
        </div>
        <pre class="improved-text">${ai.improvedText || ""}</pre>
      </section>

      <section class="result-card file-card">
        <h4>Stored File</h4>
        <p>${
          data.saved?.fileUrl
            ? `<a href="${data.saved.fileUrl}" target="_blank">Open uploaded PDF</a>`
            : "File not stored or URL not available"
        }</p>
      </section>
    `;

    // copy button handler
    const btnCopy = document.getElementById("btnCopyImproved");
    if (btnCopy) {
      btnCopy.addEventListener("click", async () => {
        const text = ai.improvedText || "";
        if (!text) return alert("No improved resume text to copy.");
        try {
          await navigator.clipboard.writeText(text);
          btnCopy.textContent = "Copied!";
          setTimeout(() => (btnCopy.textContent = "Copy Text"), 1500);
        } catch {
          alert("Could not copy, please copy manually.");
        }
      });
    }
  } catch (err) {
    loading.style.display = "none";
    console.error(err);
    alert("Upload failed. Check console.");
  }

});


