// ✅ COMPLETE FIXED analyzer/script.js - READY TO PASTE & VERCEL PERFECT
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Analyzer page loaded');
    
    const API_BASE = "https://ai-resume-analyzer-backend-nine.vercel.app/api";
    const btnUpload = document.getElementById("btnUpload");
    const fileInput = document.getElementById("fileInput");
    const jobDesc = document.getElementById("jobDesc");
    const resultDiv = document.getElementById("result");
    const loading = document.getElementById("loading");

    function getToken() { 
        return localStorage.getItem("token"); 
    }

    // FIXED TOAST - INLINE CSS (Vercel-safe)
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            padding: 1rem 1.5rem; border-radius: 12px; font-weight: 600;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateX(400px); transition: all 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.style.transform = 'translateX(0)', 100);
        
        // Animate out
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // PROTECT PAGE FIRST
    protectPage();

    if (btnUpload && fileInput && jobDesc && resultDiv) {
        btnUpload.addEventListener("click", async () => {
            if (!fileInput.files[0]) {
                showToast("Please select a PDF file first!", 'error');
                return;
            }

            const token = getToken();
            if (!token) {
                showToast("Please login first!", 'error');
                window.location.href = '/login/';
                return;
            }

            const fd = new FormData();
            fd.append("file", fileInput.files[0]);
            fd.append("jobDesc", jobDesc.value || "");

            // Show loading + disable button
            if (loading) loading.classList.remove('hidden');
            btnUpload.disabled = true;
            btnUpload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            if (resultDiv) resultDiv.innerHTML = "";

            try {
                console.log('📡 Uploading to:', `${API_BASE}/resume/analyze`);
                const res = await fetch(`${API_BASE}/resume/analyze`, {  // ✅ FIXED: Full backend URL
                    method: "POST",
                    headers: { 
                        'Authorization': `Bearer ${token}`
                        // ✅ NO Content-Type for FormData - browser sets it automatically
                    },
                    body: fd
                });

                const responseText = await res.text();
                console.log('📡 Response status:', res.status, responseText.substring(0, 200));

                if (!res.ok) {
                    console.error('❌ Server error:', res.status, responseText);
                    throw new Error(`Server error ${res.status}: ${responseText.substring(0, 100)}`);
                }

                const data = JSON.parse(responseText);
                if (loading) loading.classList.add('hidden');

                if (!data.success) {
                    if (resultDiv) resultDiv.innerHTML = `
                        <div class="result-section error-section">
                            <div class="result-card error-card">
                                <i class="fas fa-exclamation-triangle"></i>
                                <h3>Analysis Failed</h3>
                                <pre>${JSON.stringify(data, null, 2)}</pre>
                            </div>
                        </div>
                    `;
                    showToast("Analysis failed - check console", 'error');
                    return;
                }

                const ai = data.analysis || {};
                const missingSkills = (ai.missingSkills || []).map(s => `<li><i class="fas fa-times-circle"></i> ${s}</li>`).join("") || 
                                      "<li><i class='fas fa-check-circle'></i> No major missing skills detected</li>";
                const suggestions = (ai.suggestions || []).map(s => `<li><i class='fas fa-lightbulb'></i> ${s}</li>`).join("") || 
                                    "<li><i class='fas fa-check-circle'></i> No additional suggestions</li>";

                if (resultDiv) resultDiv.innerHTML = `
                    <!-- Scores Row -->
                    <div class="result-section">
                        <div class="scores-grid">
                            <div class="result-card score-card primary-score">
                                <div class="score-header">
                                    <i class="fas fa-star"></i>
                                    <h3>Overall Score</h3>
                                </div>
                                <div class="score-display">${ai.resumeScore || "N/A"}</div>
                                <div class="score-label">Out of 100</div>
                            </div>
                            
                            <div class="result-card score-card">
                                <div class="score-header">
                                    <i class="fas fa-robot"></i>
                                    <h3>ATS Score</h3>
                                </div>
                                <div class="score-display">${ai.atsScore || "N/A"}</div>
                                <div class="score-label">ATS Compatibility</div>
                            </div>
                            
                            <div class="result-card score-card">
                                <div class="score-header">
                                    <i class="fas fa-percentage"></i>
                                    <h3>Job Match</h3>
                                </div>
                                <div class="score-display">${ai.matchPercentage != null ? ai.matchPercentage + "%" : "N/A"}</div>
                                <div class="score-label">Job Description Match</div>
                            </div>
                        </div>
                    </div>

                    <!-- Lists Row -->
                    <div class="result-section">
                        <div class="lists-grid">
                            <div class="result-card list-card">
                                <div class="card-header">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <h3>Missing Skills</h3>
                                </div>
                                <ul class="skills-list">${missingSkills}</ul>
                            </div>
                            
                            <div class="result-card list-card">
                                <div class="card-header">
                                    <i class="fas fa-lightbulb"></i>
                                    <h3>AI Suggestions</h3>
                                </div>
                                <ul class="skills-list">${suggestions}</ul>
                            </div>
                        </div>
                    </div>

                    <!-- Improved Resume -->
                    <div class="result-section">
                        <div class="result-card improved-card">
                            <div class="card-header improved-header">
                                <div>
                                    <i class="fas fa-magic"></i>
                                    <h3>AI-Improved Resume</h3>
                                    <p>Professional version - ready to use</p>
                                </div>
                                <button id="btnCopyImproved" class="btn-copy">
                                    <i class="fas fa-copy"></i> Copy Text
                                </button>
                            </div>
                            <div class="improved-content">
                                <pre class="improved-text">${ai.improvedText || "No improvements generated"}</pre>
                            </div>
                        </div>
                    </div>

                    <!-- File Info -->
                    <div class="result-section">
                        <div class="result-card file-card">
                            <div class="card-header">
                                <i class="fas fa-cloud"></i>
                                <h3>File Storage</h3>
                            </div>
                            <div class="file-info">
                                ${data.saved?.fileUrl 
                                    ? `<a href="${data.saved.fileUrl}" target="_blank" class="file-link">
                                        <i class="fas fa-file-pdf"></i> Open Uploaded PDF
                                      </a>`
                                    : `<p class="no-file">File not stored or URL unavailable</p>`
                                }
                            </div>
                        </div>
                    </div>
                `;

                // Copy button functionality
                const btnCopy = document.getElementById("btnCopyImproved");
                if (btnCopy && ai.improvedText) {
                    btnCopy.addEventListener("click", async () => {
                        try {
                            await navigator.clipboard.writeText(ai.improvedText);
                            btnCopy.innerHTML = '<i class="fas fa-check"></i> Copied!';
                            btnCopy.classList.add('copied');
                            showToast('✅ Improved resume copied!', 'success');
                            setTimeout(() => {
                                btnCopy.innerHTML = '<i class="fas fa-copy"></i> Copy Text';
                                btnCopy.classList.remove('copied');
                            }, 2000);
                        } catch {
                            showToast('❌ Copy failed - select manually', 'error');
                        }
                    });
                }

                // Reset form
                btnUpload.disabled = false;
                btnUpload.innerHTML = '<i class="fas fa-rocket"></i> Analyze Another';
                showToast('✅ Analysis complete!', 'success');

            } catch (err) {
                console.error('❌ Analyzer error:', err);
                if (loading) loading.classList.add('hidden');
                btnUpload.disabled = false;
                btnUpload.innerHTML = '<i class="fas fa-rocket"></i> Analyze Resume';
                
                if (resultDiv) resultDiv.innerHTML = `
                    <div class="result-section error-section">
                        <div class="result-card error-card">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>Upload Failed</h3>
                            <p>Check console (F12) for details. Common issues: file size, network, or server error.</p>
                        </div>
                    </div>
                `;
                showToast('❌ Upload failed - check console', 'error');
            }
        });
    } else {
        console.error('❌ Required DOM elements missing');
    }
});

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/login/';
    }
}

function protectPage() {
    const token = localStorage.getItem("token");
    if (!token) {
        showToast("Please login first", true);
        window.location.href = "/login/";
        return false;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.id) throw new Error('Invalid token');
    } catch (error) {
        console.error('❌ Invalid token:', error);
        localStorage.removeItem('token');
        showToast("Session expired. Please login again", true);
        window.location.href = "/login/";
        return false;
    }
    console.log('✅ Analyzer page protected');
    return true;
}

console.log('✅ Analyzer script fully loaded & protected');
