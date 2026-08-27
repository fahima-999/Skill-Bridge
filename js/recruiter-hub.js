/* Recruiter Hub & Job Posting Logic (MongoDB Integrated) */

document.addEventListener('DOMContentLoaded', () => {
    initRecruiterHub();
});

function initRecruiterHub() {
    const companyTitle = document.getElementById('dash-recruiter-company');
    if (!companyTitle) return;

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'recruiter') {
        showToast("⚠️ Please log in as a Recruiter to view the recruiter workspace.");
    }

    if (currentUser) {
        companyTitle.textContent = (currentUser.company || currentUser.name) + " Workspace";
    }

    renderRecruiterJobsList();
    renderRecruiterApplicationsList();

    const postJobModal = document.getElementById('post-job-modal');
    const openPostJobBtn = document.getElementById('open-post-job-btn');
    const postJobCloseBtn = document.getElementById('post-job-close-btn');
    const postJobForm = document.getElementById('post-job-form');

    if (openPostJobBtn && postJobModal) {
        openPostJobBtn.addEventListener('click', () => {
            // Auto pre-fill company name if logged in as recruiter
            const companyInput = document.getElementById('job-post-company');
            if (companyInput && currentUser && currentUser.company) {
                companyInput.value = currentUser.company;
            }
            postJobModal.classList.remove('hidden');
        });
    }

    if (postJobCloseBtn && postJobModal) {
        postJobCloseBtn.addEventListener('click', () => {
            postJobModal.classList.add('hidden');
        });
    }

    if (postJobForm) {
        postJobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('job-post-title').value.trim();
            const company = document.getElementById('job-post-company').value.trim();
            const type = document.getElementById('job-post-type').value.trim();
            const salary = document.getElementById('job-post-salary').value.trim();
            const skillsRaw = document.getElementById('job-post-skills')?.value.trim() || '';

            const skillsRequired = skillsRaw ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
            const currentUser = getCurrentUser();

            try {
                const response = await fetch(`${API_BASE_URL}/jobs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        company,
                        type,
                        salary,
                        skillsRequired,
                        postedBy: currentUser ? currentUser.email : ''
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    postJobForm.reset();
                    if (postJobModal) postJobModal.classList.add('hidden');

                    renderRecruiterJobsList();
                    showToast(`🎉 Job listing "${title}" saved to MongoDB table!`);
                } else {
                    showToast(`⚠️ ${data.message || 'Failed to post job listing.'}`);
                }
            } catch (err) {
                console.error("Post Job Error:", err);
                showToast("❌ Unable to save job listing to MongoDB server.");
            }
        });
    }
}

async function renderRecruiterJobsList() {
    const tbody = document.getElementById('recruiter-jobs-list');
    const activeJobsEl = document.getElementById('dash-stat-active-jobs');
    if (!tbody) return;

    const currentUser = getCurrentUser();
    const postedBy = currentUser ? currentUser.email : '';

    try {
        const fetchUrl = postedBy
            ? `${API_BASE_URL}/jobs?postedBy=${encodeURIComponent(postedBy)}`
            : `${API_BASE_URL}/jobs`;

        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (data.success && Array.isArray(data.jobs)) {
            const allJobs = data.jobs;

            if (activeJobsEl) activeJobsEl.textContent = allJobs.length;

            tbody.innerHTML = '';

            if (allJobs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 2rem;">No job listings in MongoDB yet. Click "+ Post New Job" to add one!</td></tr>`;
                return;
            }

            allJobs.forEach(job => {
                const tr = document.createElement('tr');
                const jobId = job._id || job.id;

                tr.innerHTML = `
                    <td><strong>${escapeHtml(job.title)}</strong></td>
                    <td>${escapeHtml(job.company)}</td>
                    <td>${escapeHtml(job.type)}</td>
                    <td><span style="color: var(--primary-color); font-weight:600;">${escapeHtml(job.salary)}</span></td>
                    <td>
                        <button class="btn-delete-job" data-id="${jobId}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 500; cursor: pointer;">Delete 🗑️</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            tbody.querySelectorAll('.btn-delete-job').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (!confirm("Are you sure you want to remove this job listing from MongoDB?")) return;

                    try {
                        const delResponse = await fetch(`${API_BASE_URL}/jobs/${id}`, {
                            method: 'DELETE'
                        });
                        const delData = await delResponse.json();

                        if (delResponse.ok && delData.success) {
                            renderRecruiterJobsList();
                            showToast("🗑️ Job listing removed from MongoDB.");
                        } else {
                            showToast(`⚠️ ${delData.message || 'Failed to delete job listing.'}`);
                        }
                    } catch (err) {
                        console.error("Delete Job Error:", err);
                        showToast("❌ Unable to delete job listing from MongoDB.");
                    }
                });
            });
        }
    } catch (err) {
        console.error("Fetch Jobs Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 2rem;">Failed to connect to MongoDB server. Ensure node server.js is running.</td></tr>`;
    }
}

async function renderRecruiterApplicationsList() {
    const tbody = document.getElementById('recruiter-applications-list');
    const applicantsCountEl = document.getElementById('dash-stat-applicants');
    if (!tbody) return;

    const currentUser = getCurrentUser();
    const postedBy = currentUser ? currentUser.email : '';

    try {
        const fetchUrl = postedBy
            ? `${API_BASE_URL}/applications?postedBy=${encodeURIComponent(postedBy)}`
            : `${API_BASE_URL}/applications`;

        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (data.success && Array.isArray(data.applications)) {
            const apps = data.applications;

            if (applicantsCountEl) applicantsCountEl.textContent = apps.length;

            tbody.innerHTML = '';

            if (apps.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 2.5rem;">No candidate applications received yet. As job seekers submit applications with CVs, they will appear here live!</td></tr>`;
                return;
            }

            apps.forEach(app => {
                const tr = document.createElement('tr');
                const appId = app._id || app.id;
                const skillsList = Array.isArray(app.applicantSkills) ? app.applicantSkills : [];
                const skillsHTML = skillsList.slice(0, 4).map(s => `<span class="dash-skill-pill match" style="font-size:0.7rem; padding: 0.15rem 0.45rem;">${escapeHtml(s)}</span>`).join(' ');

                const statusColor = app.status === 'Shortlisted' ? '#10b981' : (app.status === 'Rejected' ? '#ef4444' : '#6366f1');
                const statusBg = app.status === 'Shortlisted' ? 'rgba(16, 185, 129, 0.12)' : (app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(99, 102, 241, 0.12)');

                tr.innerHTML = `
                    <td><strong>${escapeHtml(app.applicantName)}</strong></td>
                    <td>
                        <div style="font-weight: 600; color: var(--text-dark);">${escapeHtml(app.jobTitle)}</div>
                        <span style="font-size: 0.75rem; color: #64748b;">${escapeHtml(app.company)}</span>
                    </td>
                    <td>
                        <div style="font-size: 0.85rem;">✉️ ${escapeHtml(app.applicantEmail)}</div>
                        <span style="font-size: 0.75rem; color: #64748b;">💼 ${escapeHtml(app.applicantRole || 'Job Seeker')}</span>
                    </td>
                    <td>${skillsHTML || '<span style="color:#94a3b8; font-size:0.75rem;">None</span>'}</td>
                    <td>
                        <button class="btn-download-cv" data-id="${appId}" style="background: rgba(99, 102, 241, 0.1); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.25); padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem;">
                            📄 Download CV (${escapeHtml(app.cvFileName || 'resume.pdf')})
                        </button>
                    </td>
                    <td>
                        <span style="background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40; padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.78rem; font-weight: 600;">
                            ${escapeHtml(app.status || 'Applied')}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.35rem; align-items: center;">
                            <button class="btn-status-app" data-id="${appId}" data-status="Shortlisted" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer;">
                                Shortlist ✓
                            </button>
                            <button class="btn-status-app" data-id="${appId}" data-status="Rejected" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer;">
                                Reject ✕
                            </button>
                            <button class="btn-send-email" data-id="${appId}" data-name="${escapeHtml(app.applicantName)}" style="background: rgba(59,130,246,0.08); color: #3b82f6; border: 1px solid rgba(59,130,246,0.15); padding: 0.3rem 0.55rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer; display: ${app.status === 'Shortlisted' ? 'inline-flex' : 'none'};">
                                Send Email ✉️
                            </button>
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            // CV Download Listener
            tbody.querySelectorAll('.btn-download-cv').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const targetApp = apps.find(a => (a._id || a.id) === id);
                    if (targetApp && targetApp.cvFileData) {
                        const link = document.createElement('a');
                        link.href = targetApp.cvFileData; // Base64 data URL
                        link.download = targetApp.cvFileName || 'candidate_cv.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast(`📥 Downloading CV file: "${targetApp.cvFileName}" for ${targetApp.applicantName}!`);
                    } else {
                        showToast("⚠️ CV file data unavailable.");
                    }
                });
            });

            // Status Update Listeners
            tbody.querySelectorAll('.btn-status-app').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    const status = btn.getAttribute('data-status');
                    try {
                        const patchRes = await fetch(`${API_BASE_URL}/applications/${id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status })
                        });
                        const patchData = await patchRes.json();
                        if (patchRes.ok && patchData.success) {
                            renderRecruiterApplicationsList();
                            showToast(`📌 Candidate status updated to "${status}"!`);
                        }
                    } catch (err) {
                        console.error("Update Status Error:", err);
                    }
                });
            });

            // Send Email Listeners (Resend) — dynamic & applicant-specific.
            //
            // The client sends ONLY the Applicant ID (this row's Application._id).
            // The server looks up that applicant's email fresh from MongoDB and
            // sends to that address — we never pass an email, name, or job title
            // from the client, so a stale row or leftover selected-candidate state
            // can never cause an email to go to the wrong person.
            tbody.querySelectorAll('.btn-send-email').forEach(btn => {
                const originalLabel = btn.innerHTML;
                const originalStyles = {
                    background: btn.style.background,
                    color: btn.style.color,
                    borderColor: btn.style.borderColor
                };

                const resetButton = () => {
                    btn.disabled = false;
                    btn.style.opacity = '';
                    btn.style.cursor = 'pointer';
                    btn.innerHTML = originalLabel;
                    btn.style.background = originalStyles.background;
                    btn.style.color = originalStyles.color;
                    btn.style.borderColor = originalStyles.borderColor;
                };

                btn.addEventListener('click', async () => {
                    const applicantId = btn.getAttribute('data-id');
                    const name = btn.getAttribute('data-name') || 'this candidate';

                    if (!applicantId) {
                        showToast('⚠️ Missing Applicant ID — cannot send email.');
                        return;
                    }

                    // Guard against double-clicks while a send is already in flight.
                    if (btn.disabled) return;

                    // --- Loading state ---
                    btn.disabled = true;
                    btn.style.opacity = '0.65';
                    btn.style.cursor = 'not-allowed';
                    btn.innerHTML = 'Sending... ⏳';
                    showToast(`✉️ Sending email to ${name}...`);

                    try {
                        // Note: no "to" / email field in the body on purpose — the
                        // Applicant ID in the URL is the only identifier the server
                        // trusts to resolve the recipient.
                        const res = await fetch(`${API_BASE_URL}/applications/${encodeURIComponent(applicantId)}/send-email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const resp = await res.json();
                        console.log('Send-email API response:', resp);

                        if (res.ok && resp.success) {
                            // --- Success state ---
                            const mid = resp.messageId || (resp.data && (resp.data.id || resp.data.messageId));
                            btn.innerHTML = 'Sent ✓';
                            btn.style.background = 'rgba(16, 185, 129, 0.12)';
                            btn.style.color = '#10b981';
                            btn.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                            showToast(`✅ Email sent to ${resp.sentTo || name} (id: ${mid || 'unknown'}). Check spam if not in inbox.`);
                            setTimeout(resetButton, 2500);
                        } else {
                            // --- Error state ---
                            console.error('Send email response error:', resp);
                            btn.innerHTML = 'Failed ✕';
                            btn.style.background = 'rgba(239, 68, 68, 0.12)';
                            btn.style.color = '#ef4444';
                            btn.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                            showToast(`❌ ${resp.message || 'Failed to send email. Check server logs for details.'}`);
                            btn.disabled = false;
                            btn.style.opacity = '';
                            btn.style.cursor = 'pointer';
                            setTimeout(resetButton, 3000);
                        }
                    } catch (err) {
                        // --- Network/unexpected error state ---
                        console.error('Send Email Error:', err);
                        btn.innerHTML = 'Failed ✕';
                        btn.style.background = 'rgba(239, 68, 68, 0.12)';
                        btn.style.color = '#ef4444';
                        showToast('❌ Error sending email to candidate.');
                        btn.disabled = false;
                        btn.style.opacity = '';
                        btn.style.cursor = 'pointer';
                        setTimeout(resetButton, 3000);
                    }
                });
            });
        }
    } catch (err) {
        console.error("Fetch Applications Error:", err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ef4444; padding: 2rem;">Failed to fetch candidate applications from MongoDB backend.</td></tr>`;
    }
}
