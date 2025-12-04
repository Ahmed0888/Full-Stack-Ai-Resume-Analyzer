class JobTracker {
    constructor() {
        // LIVE BACKEND BASE URL
        this.API_BASE = "https://ai-resume-analyzer-backend-nine.vercel.app/api";
        this.userId = this.getUserIdFromToken();
        console.log("👤 AUTHENTICATED USER ID:", this.userId);

        // PROTECT PAGE - BLOCK IF NO VALID USER
        if (!this.userId) {
            console.log("❌ NO VALID TOKEN - REDIRECTING TO LOGIN");
            this.redirectToLogin();
            return;
        }

        this.init();
    }

    // EXTRACT REAL USER ID FROM JWT TOKEN
    getUserIdFromToken() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;

            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.id || payload.userId || payload.sub;

            if (userId) {
                localStorage.setItem("userId", userId);
                return userId;
            }
            return null;
        } catch (e) {
            console.error("❌ Token parse error:", e);
            localStorage.removeItem('token');
            return null;
        }
    }

    // PROTECT PAGE FUNCTIONALITY - FIXED LOGIN URL
    redirectToLogin() {
        document.body.innerHTML = `
            <div style="
                display: flex; flex-direction: column; align-items: center; 
                justify-content: center; height: 100vh; text-align: center;
                background: linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%);
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            ">
                <div style="
                    background: white; padding: 3rem; border-radius: 24px; 
                    box-shadow: 0 25px 60px rgba(0,0,0,0.1); max-width: 400px;
                    border: 1px solid #e5e7eb;
                ">
                    <i class="fas fa-lock" style="font-size: 4rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                    <h2 style="color: #1e293b; margin-bottom: 1rem;">Authentication Required</h2>
                    <p style="color: #64748b; margin-bottom: 2rem;">Please login to access your job dashboard</p>
                    <a href="/login/" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                        color: white; padding: 1rem 2rem; border-radius: 16px; 
                        text-decoration: none; font-weight: 700; display: inline-block;
                        box-shadow: 0 10px 25px rgba(59,130,246,0.3);
                    ">Go to Login</a>
                </div>
            </div>
        `;
        throw new Error("Authentication required");
    }

    // COMPLETE API CALL WITH FULL DEBUGGING
    async apiCall(endpoint, options = {}) {
        const token = localStorage.getItem("token");
        if (!token || !this.userId) {
            this.showToast("Session expired. Please login again", "error");
            setTimeout(() => window.location.href = "/login/", 2000);
            throw new Error("Not authenticated");
        }

        const config = {
            headers: {
                "Content-Type": "application/json",
                "X-User-ID": this.userId,
                "Authorization": `Bearer ${token}`,
            },
            ...options,
        };

        try {
            const url = `${this.API_BASE}/jobs${endpoint}`;
            console.log("🔗 API CALL:", url, { userId: this.userId, method: options.method || 'GET' });
            
            const response = await fetch(url, config);
            const contentType = response.headers.get("content-type");
            const responseText = await response.text();
            
            console.log("📡 Response:", response.status, contentType?.includes("application/json") ? 'JSON' : 'HTML', 
                       responseText.substring(0, 200));

            if (!contentType?.includes("application/json")) {
                console.error("❌ NON-JSON RESPONSE:", responseText.substring(0, 300));
                if (response.status >= 400) {
                    throw new Error(`Server returned HTML (Status: ${response.status})`);
                }
            }

            const data = JSON.parse(responseText);

            if (!response.ok) {
                const errorMsg = data.message || data.error || `HTTP ${response.status}`;
                if (response.status === 401 || response.status === 403) {
                    this.showToast("Session expired. Redirecting...", "error");
                    setTimeout(() => window.location.href = "/login/", 1500);
                }
                throw new Error(errorMsg);
            }
            return data;
        } catch (error) {
            console.error("❌ API ERROR:", error);
            this.showToast("Error: " + error.message, "error");
            throw error;
        }
    }

    // ALL ORIGINAL FEATURES + SAFETY CHECKS
    init() {
        console.log("✅ JobTracker initialized for user:", this.userId);

        // Safe DOM element access
        const elements = {
            appliedDate: document.getElementById("appliedDate"),
            jobForm: document.getElementById("jobForm"),
            clearForm: document.getElementById("clearForm"),
            editForm: document.getElementById("editForm"),
            deleteJobBtn: document.getElementById("deleteJobBtn"),
            closeModal: document.getElementById("closeModal")
        };

        if (elements.appliedDate) elements.appliedDate.valueAsDate = new Date();
        if (elements.jobForm) elements.jobForm.addEventListener("submit", (e) => this.addJob(e));
        if (elements.clearForm) elements.clearForm.addEventListener("click", () => this.clearForm());

        document.querySelectorAll(".filter-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => this.filterJobs(e.target.dataset.status));
        });

        if (elements.editForm) elements.editForm.addEventListener("submit", (e) => this.updateJob(e));
        if (elements.deleteJobBtn) elements.deleteJobBtn.addEventListener("click", () => this.deleteJob());
        if (elements.closeModal) elements.closeModal.addEventListener("click", () => this.closeModal());

        this.showUserUI();
        this.loadJobs();
    }

    showUserUI() {
        const loading = document.getElementById("loading");
        const loginPrompt = document.getElementById("loginPrompt");
        const mainContent = document.getElementById("mainContent");

        if (loading) loading.classList.add("hidden");
        if (loginPrompt) loginPrompt.classList.add("hidden");
        if (mainContent) mainContent.classList.remove("hidden");

        console.log("✅ Dashboard loaded for user:", this.userId);
    }

    async loadJobs(statusFilter = "all") {
        this.showLoading(true);
        try {
            console.log("📡 Loading jobs for user:", this.userId);
            const params = statusFilter === "all" ? "" : `?status=${statusFilter}`;
            const data = await this.apiCall(params);

            if (data.success) {
                console.log("✅ Jobs loaded:", data.jobs?.length || 0);
                this.renderJobs(data.jobs || []);
                this.updateStats(data.stats || {});
                this.updateActiveFilter(statusFilter);
            } else {
                this.renderJobs([]);
            }
        } catch (error) {
            console.error("❌ Load error:", error);
            this.renderJobs([]);
        } finally {
            this.showLoading(false);
        }
    }

    renderJobs(jobs) {
        const tbody = document.getElementById("jobsTableBody");
        if (!tbody) return;

        if (jobs.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="6">
                        <i class="fas fa-briefcase"></i>
                        <p>No jobs yet. Add your first application above!</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = jobs
            .map((job) => `
                <tr>
                    <td class="font-semibold">${this.escapeHtml(job.company)}</td>
                    <td>${this.escapeHtml(job.position)}</td>
                    <td><span class="status-badge status-${job.status?.toLowerCase() || 'pending'}">${job.status || 'Pending'}</span></td>
                    <td>${job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : '-'}</td>
                    <td>${this.escapeHtml(job.notes || "-")}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="jobTracker.editJob('${job._id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="jobTracker.deleteJob('${job._id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `)
            .join("");
    }

    async addJob(e) {
        e.preventDefault();
        const formData = {
            userId: this.userId,
            company: document.getElementById("company")?.value.trim() || '',
            position: document.getElementById("position")?.value.trim() || '',
            appliedDate: document.getElementById("appliedDate")?.value || '',
            status: document.getElementById("status")?.value || 'Applied',
            jobDescription: document.getElementById("jobDescription")?.value.trim() || '',
            notes: document.getElementById("notes")?.value.trim() || '',
        };

        if (!formData.company || !formData.position) {
            this.showToast("Please fill company and position", "error");
            return;
        }

        try {
            await this.apiCall("", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            this.showToast("✅ Job added successfully!", "success");
            this.clearForm();
            this.loadJobs();
        } catch (error) {
            console.error("❌ Add error:", error);
        }
    }

    updateStats(stats) {
        const defaultStats = { Applied: 0, Interviewing: 0, Rejected: 0, Offered: 0 };
        Object.entries({ ...defaultStats, ...stats }).forEach(([status, count]) => {
            const el = document.getElementById(`${status.toLowerCase()}Count`);
            if (el) el.textContent = count;
        });
    }

    updateActiveFilter(status) {
        document.querySelectorAll(".filter-btn").forEach((btn) =>
            btn.classList.toggle("active", btn.dataset.status === status)
        );
    }

    clearForm() {
        const form = document.getElementById("jobForm");
        if (form) form.reset();
        const dateInput = document.getElementById("appliedDate");
        if (dateInput) dateInput.valueAsDate = new Date();
    }

    filterJobs(status) {
        this.loadJobs(status);
    }

    editJob(id) {
        const editJobId = document.getElementById("editJobId");
        const editModal = document.getElementById("editModal");
        if (editJobId) editJobId.value = id;
        if (editModal) {
            editModal.classList.remove("hidden");
            editModal.classList.add("show");
        }
    }

    async updateJob(e) {
        e.preventDefault();
        const id = document.getElementById("editJobId")?.value;
        if (!id) return;

        const formData = {
            status: document.getElementById("editStatus")?.value || '',
            notes: document.getElementById("editNotes")?.value.trim() || '',
        };

        try {
            await this.apiCall(`/${id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });
            this.showToast("✅ Job updated successfully!", "success");
            this.closeModal();
            this.loadJobs();
        } catch (error) {
            console.error("❌ Update error:", error);
        }
    }

    async deleteJob(id = document.getElementById("editJobId")?.value) {
        if (!id || !confirm("Delete this job application?")) return;
        try {
            await this.apiCall(`/${id}`, { method: "DELETE" });
            this.showToast("✅ Job deleted successfully!", "success");
            this.closeModal();
            this.loadJobs();
        } catch (error) {
            console.error("❌ Delete error:", error);
        }
    }

    closeModal() {
        const editModal = document.getElementById("editModal");
        if (editModal) {
            editModal.classList.remove("show");
            editModal.classList.add("hidden");
        }
    }

    showLoading(show = true) {
        const loading = document.getElementById("loading");
        const mainContent = document.getElementById("mainContent");
        if (loading) loading.classList.toggle("hidden", !show);
        if (mainContent) mainContent.classList.toggle("hidden", show);
    }

    // FIXED TOAST - INLINE CSS (Vercel-safe)
    showToast(message, type = "success") {
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

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text || '';
        return div.innerHTML;
    }
}

// GLOBAL FUNCTIONS
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear();
        window.location.href = "/login/";
    }
}

// COMPLETE INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    try {
        const jobTracker = new JobTracker();
        window.jobTracker = jobTracker;
        console.log("✅ JobTracker fully initialized + PROTECTED ✅");
    } catch (error) {
        console.error("❌ JobTracker init failed:", error);
    }
});
