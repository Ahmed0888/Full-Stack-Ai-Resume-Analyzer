// ✅ CORRECT resumes/script.js - FULLY FIXED
let resumes = [];
let filteredResumes = [];
let currentUserId = null;
const API_BASE = "https://ai-resume-analyzer-backend-nine.vercel.app/api";

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login/';
} else {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.id;
    } catch (e) {
        localStorage.removeItem('token');
        window.location.href = '/login/';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Resumes page loaded');
    loadResumes();
    setupEventListeners();
});

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}/${endpoint}`;
    const config = {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        ...options
    };
    
    try {
        console.log('📡 API Request:', url);
        const response = await fetch(url, config);
        const text = await response.text();
        console.log('📡 Response status:', response.status, text.substring(0, 200));
        
        if (!response.ok) {
            let error = `Error ${response.status}`;
            try {
                const data = JSON.parse(text);
                error = data.message || data.error || error;
            } catch(e) {}
            throw new Error(error);
        }
        
        return JSON.parse(text);
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
}

async function loadResumes() {
    console.log('🔄 Loading resumes...');
    const loading = document.getElementById('loading');
    if (loading) loading.classList.remove('hidden');
    
    try {
        const data = await apiRequest('resume');  // ✅ CORRECT ENDPOINT: /api/resume
        console.log('✅ API Response:', data);
        
        if (data.success) {
            resumes = data.resumes || [];
            filteredResumes = [...resumes];
            console.log('✅ Resumes loaded:', resumes.length);
            renderResumes();
            renderStats();
            const emptyState = document.getElementById('emptyState');
            if (emptyState) emptyState.classList.add('hidden');
        } else {
            console.log('❌ No success:', data);
            showEmptyState();
        }
    } catch (error) {
        console.error('❌ Load resumes FAILED:', error);
        showStatus('Failed to load resumes: ' + error.message, true);
        showEmptyState();
    } finally {
        if (loading) loading.classList.add('hidden');
    }
}

// REST OF YOUR FUNCTIONS (UNCHANGED - WORKING)
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const scoreFilter = document.getElementById('scoreFilter');
    const sortSelect = document.getElementById('sortSelect');
    const closeModal = document.getElementById('closeModal');
    
    if (searchInput) searchInput.addEventListener('input', debounce(filterResumes, 300));
    if (scoreFilter) scoreFilter.addEventListener('change', filterResumes);
    if (sortSelect) sortSelect.addEventListener('change', sortResumes);
    if (closeModal) closeModal.addEventListener('click', closeModal);
    
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleQuickAction(e.target.dataset.action));
    });
}

function filterResumes() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const scoreFilter = document.getElementById('scoreFilter')?.value || '';
    
    filteredResumes = resumes.filter(resume => {
        const matchesSearch = !searchTerm || 
            getResumeTitle(resume.originalText).toLowerCase().includes(searchTerm) ||
            (resume.jobdescription && resume.jobdescription.toLowerCase().includes(searchTerm));
        
        const aiScore = resume.aiScore || 0;
        let matchesScore = true;
        
        if (scoreFilter === '90+') matchesScore = aiScore >= 90;
        else if (scoreFilter === '80-89') matchesScore = aiScore >= 80 && aiScore < 90;
        else if (scoreFilter === '70-79') matchesScore = aiScore >= 70 && aiScore < 80;
        else if (scoreFilter === 'below70') matchesScore = aiScore < 70;
        
        return matchesSearch && matchesScore;
    });
    
    sortResumes();
}

function sortResumes() {
    const sortBy = document.getElementById('sortSelect')?.value || 'date-desc';
    
    filteredResumes.sort((a, b) => {
        const scoreA = a.aiScore || 0;
        const scoreB = b.aiScore || 0;
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        
        switch (sortBy) {
            case 'date-desc': return dateB - dateA;
            case 'date-asc': return dateA - dateB;
            case 'score-desc': return scoreB - scoreA;
            case 'score-asc': return scoreA - scoreB;
            default: return dateB - dateA;
        }
    });
    
    renderResumes();
    updateResultsCount();
}

function renderResumes() {
    const container = document.getElementById('resumesList');
    if (!container) return;
    
    console.log('🔄 Rendering', filteredResumes.length, 'resumes');
    
    if (filteredResumes.length === 0) {
        container.classList.add('hidden');
        const noResumes = document.getElementById('noResumes');
        if (noResumes) noResumes.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    const noResumes = document.getElementById('noResumes');
    if (noResumes) noResumes.classList.add('hidden');
    
    container.innerHTML = filteredResumes.map((resume) => `
        <div class="resume-card" data-resume-id="${resume._id}">
            <div class="resume-card-header">
                <div>
                    <h3 class="resume-title">${getResumeTitle(resume.originalText)}</h3>
                    <p class="resume-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(resume.createdAt)}
                    </p>
                </div>
                ${resume.fileUrl ? `
                    <a href="${resume.fileUrl}" target="_blank" class="file-link" title="View PDF">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
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
                    <div class="score-circle score-purple">${(resume.matchPercentage || 0).toFixed(0)}%</div>
                    <div class="score-label">Match</div>
                </div>
            </div>

            ${resume.jobdescription ? `
                <div class="job-section">
                    <div class="job-label"><i class="fas fa-briefcase"></i> Job Applied:</div>
                    <div class="job-text">${resume.jobdescription.substring(0, 100)}${resume.jobdescription.length > 100 ? '...' : ''}</div>
                </div>
            ` : ''}

            <div class="skills-section">
                ${resume.missingSkills && resume.missingSkills.slice(0, 3).map(skill => `
                    <div class="skill-item">
                        <i class="fas fa-exclamation-circle"></i>
                        ${skill}
                    </div>
                `).join('') || ''}
            </div>

            <div class="action-overlay">
                <div class="action-btn action-view" title="View Details" data-action="view">
                    <i class="fas fa-eye"></i>
                </div>
                <div class="action-btn action-copy" title="Copy Improved" data-action="copy">
                    <i class="fas fa-copy"></i>
                </div>
                ${resume.fileUrl ? `
                    <div class="action-btn action-download" title="Download PDF" data-action="download">
                        <i class="fas fa-download"></i>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.resume-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.action-overlay .action-btn')) return;
            const resumeId = card.dataset.resumeId;
            viewDetails(resumeId);
        });
        
        card.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const resumeId = card.dataset.resumeId;
                const action = btn.dataset.action;
                showQuickModal(resumeId, action);
            });
        });
    });
    
    updateResultsCount();
}

// UTILITY FUNCTIONS (SHORTENED)
function updateResultsCount() {
    const countEl = document.getElementById('countText');
    const resultsCount = document.getElementById('resultsCount');
    
    if (countEl && filteredResumes.length > 0) {
        countEl.innerHTML = `Showing <strong>${filteredResumes.length}</strong> of ${resumes.length} resumes`;
        if (resultsCount) resultsCount.classList.remove('hidden');
    }
}

function renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid || resumes.length === 0) return;
    
    const total = resumes.length;
    const scores = resumes.map(r => r.aiScore).filter(Boolean);
    const avgScore = scores.length ? Math.round(scores.reduce((a,b) => a + b, 0) / scores.length) : 0;
    const bestScore = Math.max(...scores, 0);

    statsGrid.innerHTML = `
        <div class="stat-card stat-blue">
            <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
            <div class="stat-content">
                <p>Total Resumes</p>
                <div class="stat-number">${total}</div>
            </div>
        </div>
        <div class="stat-card stat-green">
            <div class="stat-icon"><i class="fas fa-star"></i></div>
            <div class="stat-content">
                <p>Avg Score</p>
                <div class="stat-number">${avgScore}</div>
            </div>
        </div>
        <div class="stat-card stat-purple">
            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
            <div class="stat-content">
                <p>Best Score</p>
                <div class="stat-number">${bestScore}</div>
            </div>
        </div>
    `;
}

function getResumeTitle(text) {
    const lines = (text || '').split('\n');
    return lines[0]?.substring(0, 60) + (lines[0]?.length > 60 ? '...' : '') || 'Untitled Resume';
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function showEmptyState() {
    const resumesList = document.getElementById('resumesList');
    const noResumes = document.getElementById('noResumes');
    const emptyState = document.getElementById('emptyState');
    
    if (resumesList) resumesList.classList.add('hidden');
    if (noResumes) noResumes.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
}

function showStatus(message, isError = false) {
    console[isError ? 'error' : 'log'](message);
    showToast(message, isError ? 'error' : 'success');
}

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
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// OTHER FUNCTIONS (viewDetails, copyImproved, etc.) - SAME AS BEFORE
async function viewDetails(resumeId) {
    const resume = resumes.find(r => r._id === resumeId);
    if (resume) {
        localStorage.setItem('selectedResume', JSON.stringify(resume));
        window.open('details.html', '_blank');
    }
}

function showQuickModal(resumeId, defaultAction) {
    const resume = resumes.find(r => r._id === resumeId);
    if (!resume) return;
    
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = `Quick Actions - ${getResumeTitle(resume.originalText)}`;
    
    if (defaultAction) {
        handleQuickAction(defaultAction, resumeId);
    } else {
        const quickModal = document.getElementById('quickModal');
        if (quickModal) {
            quickModal.classList.remove('hidden');
            quickModal.classList.add('show');
        }
    }
}

function handleQuickAction(action, data) {
    switch (action) {
        case 'view': viewDetails(data); break;
        case 'copy': copyImproved(btoa(encodeURIComponent(resumes.find(r => r._id === data)?.aiImprovedText || ''))); break;
        case 'download': window.open(resumes.find(r => r._id === data)?.fileUrl, '_blank'); break;
    }
}

function copyImproved(encodedText) {
    try {
        const text = decodeURIComponent(atob(encodedText));
        navigator.clipboard.writeText(text).then(() => showToast('✅ Copied!', 'success'));
    } catch (e) {
        showToast('❌ Copy failed', 'error');
    }
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = '/login/';
    }
}

console.log('✅ Resumes script LOADED - Check console for API calls!');
