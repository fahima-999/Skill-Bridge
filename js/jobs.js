/* Dynamic Jobs Loader & Explore Jobs Controller (MongoDB + Dynamic Skill Gap Modal) */

let appliedJobsSet = new Set();
let activeSkillGapJob = null;

document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    initExploreJobsFilters();
    initSkillGapModal();
});

// Load jobs dynamically for Home Page from MongoDB
async function loadJobs() {
    const jobsContainer = document.getElementById('jobs-container');
    if (!jobsContainer) return;

    try {
        jobsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 2rem;">
                <p>⌛ Loading opportunities dynamically from MongoDB...</p>
            </div>
        `;

        const response = await fetch(`${API_BASE_URL}/jobs`);
        const data = await response.json();

        if (!data.success || !Array.isArray(data.jobs) || data.jobs.length === 0) {
            jobsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No active opportunities found in MongoDB database.</p>';
            return;
        }

        const jobs = data.jobs;
        jobsContainer.innerHTML = '';

        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';

            const logoUrl = job.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60';
            const jobId = job._id || job.id;

            card.innerHTML = `
                <div class="job-header">
                    <img src="${logoUrl}" alt="${escapeHtml(job.company)} Logo" class="company-logo" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60'">
                    <div class="job-info">
                        <h3>${escapeHtml(job.title)}</h3>
                        <div class="company-name">${escapeHtml(job.company)}</div>
                    </div>
                </div>
                <div class="job-tags">
                    <span class="job-tag">${escapeHtml((job.type || '').split(' • ')[0] || 'Full-time')}</span>
                    <span class="job-tag">${escapeHtml((job.type || '').split(' • ')[1] || 'Remote')}</span>
                </div>
                <div class="job-salary">${escapeHtml(job.salary)}</div>
                <a href="jobs.html" class="btn btn-outline btn-job-apply-trigger" style="width: 100%; border-color: var(--border-color);" data-id="${jobId}">View Details & Match ${SVG_ARROW_UP_RIGHT}</a>
            `;

            jobsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error dynamically fetching jobs from MongoDB:", error);
        jobsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Failed to load opportunities from MongoDB server. Make sure node server.js is running.</p>';
    }
}

function initExploreJobsFilters() {
    const exploreContainer = document.getElementById('explore-jobs-container');
    if (!exploreContainer) return;

    renderExploreJobs();

    const searchInput = document.getElementById('explore-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const activePill = document.querySelector('#explore-filter-pills .filter-pill.active');
            const cat = activePill ? activePill.getAttribute('data-cat') : 'all';
            renderExploreJobs(cat, searchInput.value.trim());
        });
    }

    const filterPills = document.querySelectorAll('#explore-filter-pills .filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const cat = pill.getAttribute('data-cat');
            const searchVal = searchInput ? searchInput.value.trim() : '';
            renderExploreJobs(cat, searchVal);
        });
    });
}

// Dynamically fetch and render jobs for Explore Jobs page from MongoDB Atlas
async function renderExploreJobs(category = 'all', searchQuery = '') {
    const container = document.getElementById('explore-jobs-container');
    if (!container) return;

    const user = getCurrentUser() || {};
    const rawSkills = Array.isArray(user.skills) ? user.skills : (typeof user.skills === 'string' ? user.skills.split(',') : []);
    const userSkills = rawSkills.map(s => s.trim().toLowerCase()).filter(Boolean);

    try {
        if (!container.children.length) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 3rem;">
                    <p>⌛ Fetching dynamic job listings from MongoDB Atlas...</p>
                </div>
            `;
        }

        const response = await fetch(`${API_BASE_URL}/jobs`);
        const data = await response.json();

        if (!data.success || !Array.isArray(data.jobs)) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Unable to load dynamic job list from MongoDB.</p>`;
            return;
        }

        let mongoJobs = data.jobs.map(job => {
            const reqSkills = Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0 
                ? job.skillsRequired 
                : ["React.js", "JavaScript", "CSS"];

            const { matchPercentage, matchedSkills, missingSkills } = analyzeSkillGaps(userSkills, reqSkills);

            return {
                id: job._id || job.id,
                title: job.title,
                company: job.company,
                category: job.category || ((job.type || '').toLowerCase().includes('remote') ? 'remote' : 'fullstack'),
                type: job.type || 'Full-time • Remote',
                salary: job.salary || '$90,000 - $120,000 / yr',
                matchScore: matchPercentage,
                matchedSkills,
                missingSkills,
                skillsRequired: reqSkills,
                desc: job.desc || 'Recruiter posted opportunity matching current skill profile.',
                logo: job.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60'
            };
        });

        let filtered = mongoJobs;

        if (category !== 'all') {
            if (category === 'remote') {
                filtered = filtered.filter(j => (j.type || '').toLowerCase().includes('remote') || j.category === 'remote');
            } else {
                filtered = filtered.filter(j => j.category === category || (j.type || '').toLowerCase().includes(category));
            }
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(j => 
                j.title.toLowerCase().includes(query) || 
                j.company.toLowerCase().includes(query) || 
                j.desc.toLowerCase().includes(query) ||
                j.skillsRequired.some(s => s.toLowerCase().includes(query))
            );
        }

        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 3rem;">No dynamic jobs found matching your filter criteria in MongoDB. Try adjusting your search query!</p>`;
            return;
        }

        filtered.forEach(job => {
            const isApplied = appliedJobsSet.has(String(job.id));

            const skillsHTML = job.skillsRequired.map(skill => {
                const isMatch = job.matchedSkills.some(ms => ms.toLowerCase() === skill.toLowerCase());
                if (isMatch) {
                    return `<span class="dash-skill-pill match" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">✓ ${escapeHtml(skill)}</span>`;
                } else {
                    return `<span class="dash-skill-pill missing" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);">⚠️ ${escapeHtml(skill)}</span>`;
                }
            }).join('');

            const badgeBg = job.matchScore >= 80 
                ? 'rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);' 
                : (job.matchScore >= 50 
                    ? 'rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);' 
                    : 'rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);');

            const card = document.createElement('div');
            card.className = 'dash-job-card';
            card.innerHTML = `
                <div>
                    <div class="dash-job-card-header">
                        <div class="job-company-brand">
                            <img src="${job.logo}" alt="${escapeHtml(job.company)}" class="dash-job-logo" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60'">
                            <div>
                                <h4>${escapeHtml(job.title)}</h4>
                                <span class="dash-job-company">${escapeHtml(job.company)}</span>
                            </div>
                        </div>
                        <span class="job-match-badge" style="background: ${badgeBg} padding: 0.35rem 0.75rem; border-radius: 99px; font-weight: 600; font-size: 0.85rem;">
                            🎯 ${job.matchScore}% Match
                        </span>
                    </div>

                    <p class="dash-job-desc">${escapeHtml(job.desc)}</p>

                    <div class="dash-job-skills-row" style="margin-top: 0.75rem;">
                        ${skillsHTML}
                    </div>
                </div>

                <div class="dash-job-footer">
                    <div class="dash-job-meta">
                        <span class="job-type-pill">📍 ${escapeHtml(job.type)}</span>
                        <span class="job-salary-text">${escapeHtml(job.salary)}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; width: 100%; margin-top: 0.75rem;">
                        <button class="btn-analyze-gap" data-id="${job.id}" style="flex: 1; background: rgba(99, 102, 241, 0.12); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); padding: 0.5rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
                            📊 Skill Analysis
                        </button>
                        <button class="btn-apply-job ${isApplied ? 'applied' : ''}" data-id="${job.id}" style="flex: 1;">
                            ${isApplied ? '✓ Applied' : 'Apply Now ' + SVG_ARROW_UP_RIGHT}
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(card);

            const gapBtn = card.querySelector('.btn-analyze-gap');
            if (gapBtn) {
                gapBtn.addEventListener('click', () => {
                    openSkillGapModal(job);
                });
            }

            const applyBtn = card.querySelector('.btn-apply-job');
            if (applyBtn && !isApplied) {
                applyBtn.addEventListener('click', () => {
                    openJobApplicationModal(job, () => {
                        applyBtn.classList.add('applied');
                        applyBtn.innerHTML = '✓ Applied';
                    });
                });
            }
        });
    } catch (err) {
        console.error("Explore Jobs Error:", err);
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 3rem;">Unable to connect to MongoDB backend server. Please verify node server.js is running.</p>`;
    }
}

// Analyze matched vs missing skills between user profile & job requirements
function analyzeSkillGaps(userSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) {
        return { matchPercentage: 100, matchedSkills: [], missingSkills: [] };
    }

    if (!userSkills || userSkills.length === 0) {
        return { matchPercentage: 0, matchedSkills: [], missingSkills: [...jobSkills] };
    }

    const matchedSkills = [];
    const missingSkills = [];

    jobSkills.forEach(reqSkill => {
        const hasSkill = userSkills.some(us => us.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(us));
        if (hasSkill) {
            matchedSkills.push(reqSkill);
        } else {
            missingSkills.push(reqSkill);
        }
    });

    const matchPercentage = Math.round((matchedSkills.length / jobSkills.length) * 100);
    return { matchPercentage, matchedSkills, missingSkills };
}

// Skill Gap Modal Management
function initSkillGapModal() {
    const modal = document.getElementById('skill-gap-modal');
    const closeBtn = document.getElementById('skill-gap-close-btn');
    const closeBtnAlt = document.getElementById('btn-close-gap-modal');
    const addGapsBtn = document.getElementById('btn-add-gaps-to-profile');

    if (!modal) return;

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnAlt) closeBtnAlt.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    if (addGapsBtn) {
        addGapsBtn.addEventListener('click', async () => {
            const currentUser = getCurrentUser();
            if (!currentUser || !currentUser.email) {
                showToast("⚠️ Please log in to add skills to your profile!");
                closeModal();
                if (typeof showAuthModal === 'function') showAuthModal('login');
                return;
            }

            if (!activeSkillGapJob || !activeSkillGapJob.missingSkills || activeSkillGapJob.missingSkills.length === 0) {
                showToast("✨ You already possess 100% of the required skills for this job!");
                closeModal();
                return;
            }

            const currentSkills = Array.isArray(currentUser.skills) ? [...currentUser.skills] : [];
            const newSkills = [...currentSkills];

            activeSkillGapJob.missingSkills.forEach(ms => {
                if (!newSkills.some(s => s.toLowerCase() === ms.toLowerCase())) {
                    newSkills.push(ms);
                }
            });

            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: currentUser.email,
                        skills: newSkills
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setCurrentUser(data.user);
                    closeModal();
                    renderExploreJobs();
                    showToast(`🎉 Added missing skills to your MongoDB profile! Match score updated to 100%!`);
                } else {
                    showToast(`⚠️ ${data.message || 'Failed to update skills in MongoDB.'}`);
                }
            } catch (err) {
                console.error("Add Skill Gaps Error:", err);
                showToast("❌ Unable to save updated skills to MongoDB server.");
            }
        });
    }
}

function openSkillGapModal(job) {
    const modal = document.getElementById('skill-gap-modal');
    if (!modal) return;

    activeSkillGapJob = job;

    const titleEl = document.getElementById('modal-gap-job-title');
    const companyEl = document.getElementById('modal-gap-company-name');
    const scoreBadgeEl = document.getElementById('modal-gap-score-badge');
    const progressBarEl = document.getElementById('modal-gap-progress-bar');
    const matchedContainer = document.getElementById('modal-matched-skills-container');
    const missingContainer = document.getElementById('modal-missing-skills-container');

    if (titleEl) titleEl.textContent = job.title;
    if (companyEl) companyEl.textContent = job.company + ' • ' + job.type;
    if (scoreBadgeEl) scoreBadgeEl.textContent = `${job.matchScore}% Match`;

    if (progressBarEl) {
        progressBarEl.style.width = `${job.matchScore}%`;
        progressBarEl.style.background = job.matchScore >= 80 
            ? 'linear-gradient(90deg, #3b82f6, #10b981)' 
            : (job.matchScore >= 50 
                ? 'linear-gradient(90deg, #f59e0b, #eab308)' 
                : 'linear-gradient(90deg, #ef4444, #f97316)');
    }

    if (matchedContainer) {
        if (job.matchedSkills && job.matchedSkills.length > 0) {
            matchedContainer.innerHTML = job.matchedSkills.map(s => `
                <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.4rem 0.85rem; border-radius: 99px; font-size: 0.85rem; font-weight: 500;">
                    ✓ ${escapeHtml(s)}
                </span>
            `).join('');
        } else {
            matchedContainer.innerHTML = `<span style="color: #94a3b8; font-size: 0.85rem; font-style: italic;">No matched skills found in your profile.</span>`;
        }
    }

    if (missingContainer) {
        if (job.missingSkills && job.missingSkills.length > 0) {
            missingContainer.innerHTML = job.missingSkills.map(s => `
                <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 0.4rem 0.85rem; border-radius: 99px; font-size: 0.85rem; font-weight: 500;">
                    ⚠️ ${escapeHtml(s)} (Missing)
                </span>
            `).join('');
        } else {
            missingContainer.innerHTML = `<span style="color: #10b981; font-size: 0.85rem; font-weight: 500;">🎉 Perfect fit! You possess all required skills for this role!</span>`;
        }
    }

    // Populate Recommended Courses for Gap Skills
    const coursesSection = document.getElementById('modal-recommended-courses-section');
    const coursesContainer = document.getElementById('modal-gap-courses-container');

    if (coursesSection && coursesContainer) {
        if (job.missingSkills && job.missingSkills.length > 0 && typeof getCourseForSkill === 'function') {
            const recommendedCourses = [];
            job.missingSkills.forEach(ms => {
                const course = getCourseForSkill(ms);
                if (course && !recommendedCourses.some(rc => rc.id === course.id)) {
                    recommendedCourses.push({ ...course, targetSkill: ms });
                }
            });

            if (recommendedCourses.length > 0) {
                coursesSection.style.display = 'block';
                coursesContainer.innerHTML = recommendedCourses.map(c => `
                    <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 10px; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span style="font-size: 1.5rem; background: rgba(255,255,255,0.08); padding: 0.4rem; border-radius: 8px;">${c.icon}</span>
                            <div>
                                <h5 style="font-size: 0.88rem; font-weight: 600; color: #f8fafc; margin: 0 0 0.15rem 0;">${escapeHtml(c.title)}</h5>
                                <span style="font-size: 0.75rem; color: #94a3b8;">Gap Skill: <strong style="color: #fbbf24;">${escapeHtml(c.targetSkill)}</strong> • Platform: <strong style="color: #38bdf8;">${escapeHtml(c.platform || 'External Course')}</strong></span>
                            </div>
                        </div>
                        <button class="btn-enroll-gap-course" data-id="${c.id}" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none; padding: 0.45rem 0.85rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap;">
                            View Outline & Open Course →
                        </button>
                    </div>
                `).join('');

                coursesContainer.querySelectorAll('.btn-enroll-gap-course').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const courseId = btn.getAttribute('data-id');
                        const course = recommendedCourses.find(rc => rc.id === courseId);
                        if (course && typeof openCourseDetailsModal === 'function') {
                            openCourseDetailsModal(course, async (enrolledCourse) => {
                                const currentUser = getCurrentUser();
                                if (currentUser) {
                                    const rawSkills = Array.isArray(currentUser.skills) ? currentUser.skills : [];
                                    const uSkills = rawSkills.map(s => s.trim().toLowerCase()).filter(Boolean);
                                    const updatedAnalysis = analyzeSkillGaps(uSkills, job.skillsRequired);
                                    job.matchScore = updatedAnalysis.matchPercentage;
                                    job.matchedSkills = updatedAnalysis.matchedSkills;
                                    job.missingSkills = updatedAnalysis.missingSkills;
                                    openSkillGapModal(job);
                                    if (typeof renderExploreJobs === 'function') renderExploreJobs();
                                }
                            });
                        }
                    });
                });
            } else {
                coursesSection.style.display = 'none';
            }
        } else {
            coursesSection.style.display = 'none';
        }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/* ==========================================
   JOB APPLICATION & CV UPLOAD DIALOG MODAL
   ========================================== */

function openJobApplicationModal(job, onSuccessCallback) {
    let modal = document.getElementById('apply-job-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'apply-job-modal';
        modal.className = 'modal-overlay hidden';
        document.body.appendChild(modal);
    }

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!currentUser || !currentUser.email) {
        if (typeof showToast === 'function') showToast("⚠️ Please log in to submit a job application and upload your CV!");
        if (typeof showAuthModal === 'function') showAuthModal('login');
        return;
    }

    const rawSkills = Array.isArray(currentUser.skills) ? currentUser.skills : [];
    const skillsHTML = rawSkills.length > 0
        ? rawSkills.map(s => `<span style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.78rem; font-weight: 500;">✓ ${escapeHtml(s)}</span>`).join(' ')
        : `<span style="color: #94a3b8; font-size: 0.8rem; font-style: italic;">No verified skills listed yet</span>`;

    modal.innerHTML = `
        <div class="modal-card" style="max-width: 620px; width: 92%; max-height: 90vh; overflow-y: auto; background: #0f172a; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 20px; padding: 2rem; color: #f8fafc; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <button id="close-apply-modal-btn" class="modal-close-btn" aria-label="Close modal" style="top: 1.25rem; right: 1.25rem; color: #94a3b8; font-size: 1.5rem;">&times;</button>

            <!-- Modal Header -->
            <div style="margin-bottom: 1.25rem;">
                <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.78rem; font-weight: 600;">
                    Job Application
                </span>
                <h2 style="font-size: 1.4rem; font-weight: 700; color: #ffffff; margin: 0.5rem 0 0.2rem 0;">
                    Apply for ${escapeHtml(job.title)}
                </h2>
                <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">
                    ${escapeHtml(job.company)} • ${escapeHtml(job.type || 'Full-time')}
                </p>
            </div>

            <!-- Form -->
            <form id="apply-job-form" onsubmit="return false;">
                <!-- Profile Overview Section -->
                <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.1rem; margin-bottom: 1.25rem;">
                    <h4 style="font-size: 0.88rem; font-weight: 600; color: #818cf8; margin: 0 0 0.75rem 0;">👤 Applicant Profile Information</h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.75rem;">
                        <div>
                            <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.3rem;">Full Name</label>
                            <input type="text" id="app-form-name" value="${escapeHtml(currentUser.name || '')}" required class="dash-input" style="background: #1e293b; color: #f8fafc; border-color: rgba(255,255,255,0.15);">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.3rem;">Email Address</label>
                            <input type="email" id="app-form-email" value="${escapeHtml(currentUser.email || '')}" required class="dash-input" style="background: #1e293b; color: #f8fafc; border-color: rgba(255,255,255,0.15);">
                        </div>
                    </div>

                    <div style="margin-bottom: 0.75rem;">
                        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.3rem;">Target Role / Professional Title</label>
                        <input type="text" id="app-form-role" value="${escapeHtml(currentUser.targetRole || 'Job Seeker')}" class="dash-input" style="background: #1e293b; color: #f8fafc; border-color: rgba(255,255,255,0.15);">
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.35rem;">Verified Skill Passport Tags</label>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                            ${skillsHTML}
                        </div>
                    </div>
                </div>

                <!-- CV Upload Box -->
                <div style="background: rgba(30, 41, 59, 0.6); border: 2px dashed rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 1.25rem; text-align: center; margin-bottom: 1.25rem; transition: border-color 0.2s ease;" id="cv-drop-zone">
                    <span style="font-size: 2rem; display: block; margin-bottom: 0.35rem;">📄</span>
                    <h4 style="font-size: 0.92rem; font-weight: 600; color: #f8fafc; margin: 0 0 0.25rem 0;">Upload Your CV / Resume</h4>
                    <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 0.85rem 0;">Accepted formats: PDF, DOC, DOCX, TXT (Max 10MB)</p>
                    
                    <input type="file" id="app-form-cv-file" accept=".pdf,.doc,.docx,.txt" required style="display: none;">
                    
                    <button type="button" id="btn-select-cv" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); padding: 0.5rem 1.1rem; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer;">
                        📂 Choose CV File
                    </button>
                    
                    <div id="cv-file-preview" style="margin-top: 0.75rem; font-size: 0.82rem; color: #10b981; font-weight: 600; display: none;">
                        ✓ <span id="cv-file-name">resume.pdf</span> (<span id="cv-file-size">0 KB</span>)
                    </div>
                </div>

                <!-- Cover Letter / Message (Optional) -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-size: 0.8rem; color: #cbd5e1; font-weight: 500; margin-bottom: 0.35rem;">Short Note / Cover Message (Optional)</label>
                    <textarea id="app-form-cover" rows="2" class="dash-input" placeholder="Introduce yourself or share why you're a great fit..." style="background: #1e293b; color: #f8fafc; border-color: rgba(255,255,255,0.15);"></textarea>
                </div>

                <!-- Footer Buttons -->
                <div style="display: flex; gap: 0.85rem; justify-content: flex-end;">
                    <button type="button" id="btn-close-apply-modal" class="btn btn-outline" style="min-width: 100px; justify-content: center;">
                        Cancel
                    </button>
                    <button type="submit" id="btn-submit-application" class="btn btn-dark" style="flex: 1; min-width: 220px; justify-content: center; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 0.7rem 1.2rem; font-weight: 700; border-radius: 10px; border: none; cursor: pointer;">
                        Submit Application & Upload CV 📄🚀
                    </button>
                </div>
            </form>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    const closeBtn = document.getElementById('close-apply-modal-btn');
    const closeBtnAlt = document.getElementById('btn-close-apply-modal');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnAlt) closeBtnAlt.addEventListener('click', closeModal);

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // File Selection Handling
    const fileInput = document.getElementById('app-form-cv-file');
    const selectCvBtn = document.getElementById('btn-select-cv');
    const filePreview = document.getElementById('cv-file-preview');
    const fileNameSpan = document.getElementById('cv-file-name');
    const fileSizeSpan = document.getElementById('cv-file-size');

    if (selectCvBtn && fileInput) {
        selectCvBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                if (fileNameSpan) fileNameSpan.textContent = file.name;
                if (fileSizeSpan) fileSizeSpan.textContent = Math.round(file.size / 1024) + ' KB';
                if (filePreview) filePreview.style.display = 'block';
            }
        });
    }

    // Form Submission
    const form = document.getElementById('apply-job-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!fileInput || !fileInput.files || !fileInput.files[0]) {
                if (typeof showToast === 'function') showToast("⚠️ Please select your CV file before submitting!");
                return;
            }

            const file = fileInput.files[0];
            const name = document.getElementById('app-form-name').value.trim();
            const email = document.getElementById('app-form-email').value.trim();
            const role = document.getElementById('app-form-role').value.trim();
            const coverLetter = document.getElementById('app-form-cover').value.trim();
            const submitBtn = document.getElementById('btn-submit-application');

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '⏳ Uploading CV & Submitting to MongoDB...';
            }

            // Convert CV File to Base64 Data URL
            const reader = new FileReader();
            reader.onload = async () => {
                const cvFileData = reader.result; // Base64 data URL

                try {
                    const response = await fetch(`${API_BASE_URL}/applications`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jobId: String(job.id),
                            jobTitle: job.title,
                            company: job.company,
                            applicantName: name,
                            applicantEmail: email,
                            applicantRole: role,
                            applicantSkills: Array.isArray(currentUser.skills) ? currentUser.skills : [],
                            coverLetter,
                            cvFileName: file.name,
                            cvFileData,
                            cvFileType: file.type || 'application/pdf'
                        })
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        appliedJobsSet.add(String(job.id));
                        closeModal();
                        if (typeof showToast === 'function') {
                            showToast(`🎉 Application & CV uploaded to MongoDB for "${job.title}" at ${job.company}!`);
                        }

                        if (typeof onSuccessCallback === 'function') {
                            onSuccessCallback();
                        }
                    } else {
                        if (typeof showToast === 'function') showToast(`⚠️ ${data.message || 'Failed to submit application.'}`);
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Submit Application & Upload CV 📄🚀';
                        }
                    }
                } catch (err) {
                    console.error("Application Submit Error:", err);
                    if (typeof showToast === 'function') showToast("❌ Server connection error while uploading application.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Submit Application & Upload CV 📄🚀';
                    }
                }
            };

            reader.readAsDataURL(file);
        });
    }
}
