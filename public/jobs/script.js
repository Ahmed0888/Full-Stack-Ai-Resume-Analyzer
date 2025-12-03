// public/js/jobs.js
const btnAddJob = document.getElementById("btnAddJob");
const jobsTableBody = document.querySelector("#jobsTable tbody");
const jobsMsg = document.getElementById("jobsMsg");

function getToken() {
  return localStorage.getItem("token");
}

async function fetchJobs() {
  const token = getToken();
  if (!token) {
    jobsMsg.innerText = "Please login on index page";
    return;
  }

  try {
    const res = await fetch("/api/jobs", {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    if (!data.success) {
      jobsMsg.innerText = "Failed to load jobs";
      return;
    }

    if (!data.jobs.length) {
      document.getElementById("emptyState").style.display = "block";
    } else {
      document.getElementById("emptyState").style.display = "none";
    }

    jobsTableBody.innerHTML = data.jobs
      .map(j => `
        <tr data-id="${j._id}">
          <td>${j.company}</td>
          <td>${j.position}</td>
          <td>${j.jobPostStatus || "open"}</td>
          <td>${j.jobType || "-"}</td>
          <td>${j.appliedDate ? new Date(j.appliedDate).toLocaleDateString() : "-"}</td>
          <td>
            <button class="btnEdit">Edit</button>
            <button class="btnDel">Delete</button>
          </td>
        </tr>
      `)
      .join("");
  } catch (err) {
    console.error(err);
    jobsMsg.innerText = "Error fetching";
  }
}

// Add Job
btnAddJob.addEventListener("click", async () => {
  const token = getToken();
  if (!token) return alert("Please login");

  const payload = {
    company: document.getElementById("jobCompany").value,
    position: document.getElementById("jobPosition").value,
    jobPostStatus: document.getElementById("jobPostStatus").value,
    status: document.getElementById("jobStatus").value,
    jobLocation: document.getElementById("jobLocation").value,
    jobType: document.getElementById("jobType").value,
    salary: document.getElementById("jobSalary").value,
    url: document.getElementById("jobUrl").value,
    jobDescription: document.getElementById("jobDesc").value,
    appliedDate: document.getElementById("jobDate").value,
    notes: document.getElementById("jobNotes").value
  };

  try {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      jobsMsg.innerText = data.message || "Add failed";
      return;
    }

    jobsMsg.innerText = "Job added";
    fetchJobs();
  } catch (err) {
    console.error(err);
    jobsMsg.innerText = "Error adding job";
  }
});

// Edit + Delete (Delegation)
document.addEventListener("click", async (e) => {
  if (e.target.matches(".btnDel")) {
    const row = e.target.closest("tr");
    const id = row.dataset.id;

    if (!confirm("Delete this job?")) return;

    const token = getToken();
    await fetch("/api/jobs/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    fetchJobs();
  }

  if (e.target.matches(".btnEdit")) {
    const row = e.target.closest("tr");
    const id = row.dataset.id;

    const newPostStatus = prompt(
      "Job Posting Status (open/paused/closed/filled/expired/draft):",
      row.children[2].innerText
    );

    const newMyStatus = prompt(
      "Your Status (Applied/Interviewing/Offered/Rejected):"
    );

    const token = getToken();

    await fetch("/api/jobs/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        jobPostStatus: newPostStatus,
        status: newMyStatus
      })
    });

    fetchJobs();
  }
});

// Load on page start
fetchJobs();
