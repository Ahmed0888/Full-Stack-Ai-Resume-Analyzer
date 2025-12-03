let resumes = [];
let currentUserId = null;
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login.html';
} else {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.id;
    } catch (e) {
        window.location.href = '/login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadResumes();
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

async function loadResumes() {
    const loading = document.getElementById('loading');
    const resumesList = document.getElementById('resumesList');
    
    loading.classList.remove('hidden');
    resumesList.innerHTML = '';

    try {
        const response = await fetch('/api/resume', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            resumes = data.resumes;
            renderResumes();
            renderStats();
            document.getElementById('noResumes').classList.add('hidden');
        } else {
            showNoResumes();
        }
    } catch (error) {
        console.error('Error:', error);
        showNoResumes();
    } finally {
        loading.classList.add('hidden');
    }
}

function renderResumes() {
    const container = document.getElementById('resumesList');
    
    if (resumes.length === 0) {
        showNoResumes();
        return;
    }

    container.innerHTML = resumes.map(resume => `
        <div class="resume-card">
            <div class="resume-header">
                <div>
                    <h3 class="resume-title">${getResumeTitle(resume.originalText)}</h3>
                    <p class="resume-date">${formatDate(resume.createdAt)}</p>
                </div>
                ${resume.fileUrl ? `<a href="${resume.fileUrl}" target="_blank" class="file-link" title="View PDF">
                    <i class="fas fa-external-link-alt"></i>
                </a>` : ''}
            </div>

            <div class="scores-grid">
                <div class="score-item">
                    <div class="score-circle score-blue">${resume.aiScore || 0}</div>
                    <div class="score-label">AI Score</div>
                </div>
                <div class="score-item">
                    <div class="score-circle score-green">${resume.atsScore || 0}</div>
                    <div class="score-label">ATS Score</div>
                </div>
                <div class="score-item">
                    <div class="score-circle score-purple">${resume.matchPercentage || 0}%</div>
                    <div class="score-label">Match %</div>
                </div>
            </div>

            ${resume.jobdescription ? `
                <div class="job-section">
                    <div class="job-label">Job Applied:</div>
                    <div class="job-text">${resume.jobdescription}</div>
                </div>
            ` : ''}

            <div class="skills-section">
                ${resume.missingSkills.slice(0, 3).map(skill => `
                    <div class="skill-item">
                        <i class="fas fa-exclamation-circle"></i>
                        <span class="skill-text">${skill}</span>
                    </div>
                `).join('')}
            </div>

            <div class="action-buttons">
                <button class="btn-view" onclick="viewDetails('${resume._id}')" title="View full analysis">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn-copy" onclick="copyImproved('${btoa(encodeURIComponent(resume.aiImprovedText || ''))}')" title="Copy improved resume">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderStats() {
    const total = resumes.length;
    const scores = resumes.map(r => r.aiScore).filter(Boolean);
    const avgScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
    const bestScore = Math.max(...scores, 0);

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card stat-blue">
            <div class="stat-icon bg-blue-100 text-blue-600"><i class="fas fa-chart-line"></i></div>
            <div class="stat-content">
                <p>Total Resumes</p>
                <p class="stat-number">${total}</p>
            </div>
        </div>
        <div class="stat-card stat-green">
            <div class="stat-icon bg-green-100 text-green-600"><i class="fas fa-star"></i></div>
            <div class="stat-content">
                <p>Avg Score</p>
                <p class="stat-number">${avgScore}</p>
            </div>
        </div>
        <div class="stat-card stat-purple">
            <div class="stat-icon bg-purple-100 text-purple-600"><i class="fas fa-trophy"></i></div>
            <div class="stat-content">
                <p>Best Score</p>
                <p class="stat-number">${bestScore}</p>
            </div>
        </div>
    `;
}

function getResumeTitle(text) {
    const lines = text.split('\n');
    return lines[0]?.substring(0, 60) + (lines[0]?.length > 60 ? '...' : '');
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNoResumes() {
    document.getElementById('resumesList').innerHTML = '';
    document.getElementById('noResumes').classList.remove('hidden');
    document.getElementById('statsGrid').innerHTML = '';
}

async function viewDetails(resumeId) {
    const resume = resumes.find(r => r._id === resumeId);
    if (resume) {
        localStorage.setItem('selectedResume', JSON.stringify(resume));
        window.open('details.html', '_blank');
    }
}

function copyImproved(encodedText) {
    try {
        const text = decodeURIComponent(atob(encodedText));
        navigator.clipboard.writeText(text).then(() => {
            showToast('Improved resume copied!', 'success');
        });
    } catch (e) {
        console.error('Copy failed:', e);
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function logout() {
    localStorage.clear();
    window.location.href = '/login';
}
