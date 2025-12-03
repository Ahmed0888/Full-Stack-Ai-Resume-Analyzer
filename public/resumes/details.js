let currentResume = null;
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
    const selectedResume = localStorage.getItem('selectedResume');
    
    if (!token || !selectedResume) {
        window.location.href = '/resumes/';
        return;
    }

    try {
        currentResume = JSON.parse(selectedResume);
        loadResumeDetails();
    } catch (e) {
        window.location.href = '/resumes/';
    }

    // Event listeners
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = '/resumes/';
    });
    
    document.getElementById('printBtn').addEventListener('click', printResume);
    document.getElementById('copyImproved').addEventListener('click', copyImprovedResume);
    document.getElementById('downloadImproved').addEventListener('click', downloadImproved);
});

function loadResumeDetails() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');

    // Update scores
    document.getElementById('mainScore').textContent = currentResume.aiScore || 0;
    document.getElementById('aiScore').textContent = currentResume.aiScore || 0;
    document.getElementById('atsScore').textContent = currentResume.atsScore || 0;
    document.getElementById('matchScore').textContent = (currentResume.matchPercentage || 0) + '%';

    // Original resume
    document.getElementById('originalResume').textContent = currentResume.originalText || 'No original text available';

    // Improved resume
    document.getElementById('improvedResume').textContent = currentResume.aiImprovedText || 'No improved text available';

    // Job description
    const jobDesc = currentResume.jobdescription || 'No job description provided';
    document.getElementById('jobDescription').innerHTML = `<p>${jobDesc}</p>`;

    // Missing skills
    const skillsContainer = document.getElementById('missingSkills');
    if (currentResume.missingSkills && currentResume.missingSkills.length > 0) {
        skillsContainer.innerHTML = currentResume.missingSkills.map(skill => `
            <div class="skill-tag">
                <i class="fas fa-times-circle"></i>
                ${skill}
            </div>
        `).join('');
    } else {
        skillsContainer.innerHTML = '<p class="text-gray-500">No missing skills detected</p>';
    }

    // Suggestions
    renderSuggestions();

    // File link
    if (currentResume.fileUrl) {
        document.getElementById('fileSection').style.display = 'block';
        document.getElementById('fileLink').href = currentResume.fileUrl;
    }
}

function renderSuggestions() {
    const container = document.getElementById('suggestionsList');
    
    if (!currentResume.suggestions || currentResume.suggestions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No suggestions available</p>';
        return;
    }

    container.innerHTML = currentResume.suggestions.map((suggestion, index) => `
        <div class="suggestion-item">
            <h4>${index + 1}. ${suggestion.split('.')[0]}</h4>
            <p>${suggestion}</p>
        </div>
    `).join('');
}

function copyImprovedResume() {
    const text = currentResume.aiImprovedText || '';
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ Improved resume copied to clipboard!', 'success');
    }).catch(() => {
        showToast('❌ Failed to copy', 'error');
    });
}

function downloadImproved() {
    const text = currentResume.aiImprovedText || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `improved-resume-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ Improved resume downloaded!', 'success');
}

function printResume() {
    window.print();
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 font-semibold ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('translate-x-0');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('translate-x-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// /* Print Styles */
// @media print {
//     .navbar, .preview-actions, .btn-secondary, .btn-print, .btn-copy-large, .btn-download, #fileSection {
//         display: none !important;
//     }
    
//     .content-wrapper {
//         box-shadow: none;
//         border-radius: 0;
//     }
    
//     .preview-box {
//         border: none;
//         box-shadow: none;
//         max-height: none;
//         min-height: auto;
//     }
// }
