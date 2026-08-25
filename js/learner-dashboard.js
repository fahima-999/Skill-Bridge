/* Learner Dashboard Controller (100% MongoDB Integrated) */

let currentSkillsList = [];

document.addEventListener('DOMContentLoaded', () => {
    initLearnerDashboardPage();
});

function initLearnerDashboardPage() {
    const dashboardContainer = document.querySelector('.learner-dash-layout');
    if (!dashboardContainer) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast("⚠️ Please log in to view your dashboard.");
        window.location.href = 'index.html#login';
        return;
    }

    if (currentUser.role === 'recruiter') {
        showToast("ℹ️ Learner Dashboard is for Job Seekers. Redirecting to Recruiter Hub...");
        window.location.href = 'recruiter-hub.html';
        return;
    }

    // Check URL hash tab
    if (window.location.hash === '#courses' || window.location.hash === '#learning-paths') {
        switchLearnerTab('courses');
    } else if (window.location.hash === '#profile') {
        switchLearnerTab('profile');
    } else if (window.location.hash === '#explore') {
        switchLearnerTab('explore');
    } else {
        switchLearnerTab('statistics');
    }

    // Sidebar Tab Clicks
    const sidebarItems = document.querySelectorAll('.learner-dash-sidebar .sidebar-nav-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.getAttribute('data-tab');
            switchLearnerTab(tab);
        });
    });

    // Upgrade Pro Button
    const upgradeBtn = document.getElementById('btn-upgrade-pro');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            showToast("🚀 Upgrade Request Received! PRO AI Skill Analyzer unlocked!");
        });
    }

    // Profile Form & Skills Manager Event Listeners
    const profileForm = document.getElementById('profile-update-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('edit-profile-name').value.trim();
            const accountRole = document.getElementById('edit-profile-account-role')?.value || 'seeker';
            const role = document.getElementById('edit-profile-role').value.trim();
            const location = document.getElementById('edit-profile-location')?.value.trim() || '';
            const bio = document.getElementById('edit-profile-bio').value.trim();

            const user = getCurrentUser();
            if (!user || !user.email) {
                showToast("⚠️ You must be logged in to update your profile.");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        name,
                        role: accountRole,
                        targetRole: role,
                        location,
                        bio,
                        skills: [...currentSkillsList]
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    notifyProfileUpdated(data.user);
                    showToast("✅ Profile updated successfully in MongoDB!");
                } else {
                    showToast(`⚠️ ${data.message || 'Failed to update profile.'}`);
                }
            } catch (err) {
                console.error("Profile Update Error:", err);
                showToast("❌ Unable to update profile in MongoDB server.");
            }
        });
    }

    // Add Skill Button & Keypress Listener
    const addSkillBtn = document.getElementById('btn-add-skill');
    const addSkillInput = document.getElementById('add-skill-input');

    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', handleAddSkill);
    }
    if (addSkillInput) {
        addSkillInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
            }
        });
    }

    // Initialize Courses Filters & Search
    initDashboardCoursesFilters();

    // Settings Save Button
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const highContrastCheck = document.getElementById('setting-high-contrast');

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            if (highContrastCheck && highContrastCheck.checked) {
                document.body.classList.add('high-contrast-mode');
            } else {
                document.body.classList.remove('high-contrast-mode');
            }
            showToast("⚙️ Preferences saved successfully!");
        });
    }
}

function switchLearnerTab(tabName) {
    const sidebarItems = document.querySelectorAll('.sidebar-nav-item');
    const tabContents = document.querySelectorAll('.dash-tab-content');

    sidebarItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    tabContents.forEach(content => {
        if (content.id === `dash-tab-${tabName}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    if (tabName === 'courses') {
        renderDashboardCourses();
    }
}

function syncProfileData() {
    const user = getCurrentUser();
    if (!user) return;

    if (Array.isArray(user.skills)) {
        currentSkillsList = [...user.skills];
    } else if (typeof user.skills === 'string') {
        currentSkillsList = user.skills.split(',').map(s => s.trim()).filter(Boolean);
    } else {
        currentSkillsList = [];
    }

    const initials = (user.name || 'User').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

    const avatarEl = document.getElementById('dash-user-avatar');
    const sidebarNameEl = document.getElementById('dash-sidebar-user-name');
    const sidebarRoleEl = document.getElementById('dash-sidebar-user-role');

    if (avatarEl) avatarEl.textContent = initials;
    if (sidebarNameEl) sidebarNameEl.textContent = user.name || '';
    if (sidebarRoleEl) sidebarRoleEl.textContent = user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker';

    const pAvatar = document.getElementById('profile-display-avatar');
    const pName = document.getElementById('profile-display-name');
    const pRole = document.getElementById('profile-display-role');
    const pBio = document.getElementById('profile-display-bio');
    const pEmail = document.getElementById('profile-display-email');
    const pLocation = document.getElementById('profile-display-location');
    const pTarget = document.getElementById('profile-display-target');

    if (pAvatar) pAvatar.textContent = initials;
    if (pName) pName.textContent = user.name || '';
    if (pRole) pRole.textContent = user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker';
    if (pBio) pBio.textContent = user.bio || "No bio added yet.";
    if (pEmail) pEmail.textContent = user.email || "";
    if (pLocation) pLocation.textContent = user.location || "Not specified";
    if (pTarget) pTarget.textContent = user.targetRole || "Not specified";

    renderSkillsList();

    const eName = document.getElementById('edit-profile-name');
    const eAccountRole = document.getElementById('edit-profile-account-role');
    const eRole = document.getElementById('edit-profile-role');
    const eLocation = document.getElementById('edit-profile-location');
    const eBio = document.getElementById('edit-profile-bio');

    if (eName) eName.value = user.name || "";
    if (eAccountRole) eAccountRole.value = user.role || "seeker";
    if (eRole) eRole.value = user.targetRole || "";
    if (eLocation) eLocation.value = user.location || "";
    if (eBio) eBio.value = user.bio || "";
}

function handleAddSkill() {
    const input = document.getElementById('add-skill-input');
    if (!input) return;
    const val = input.value.trim();
    if (!val) {
        showToast("⚠️ Please enter a skill name first.");
        return;
    }
    if (currentSkillsList.some(s => s.toLowerCase() === val.toLowerCase())) {
        showToast("⚠️ This skill is already in your list.");
        return;
    }
    currentSkillsList.push(val);
    saveCurrentSkillsState();
    input.value = '';
    renderSkillsList();
    showToast(`✨ Added skill "${val}"`);
}

function handleEditSkill(index) {
    if (index < 0 || index >= currentSkillsList.length) return;
    const oldSkill = currentSkillsList[index];
    const newSkill = prompt("Edit skill name:", oldSkill);
    if (newSkill !== null) {
        const trimmed = newSkill.trim();
        if (trimmed && trimmed !== oldSkill) {
            currentSkillsList[index] = trimmed;
            saveCurrentSkillsState();
            renderSkillsList();
            showToast(`✏️ Updated skill to "${trimmed}"`);
        }
    }
}

function handleDeleteSkill(index) {
    if (index < 0 || index >= currentSkillsList.length) return;
    const removed = currentSkillsList.splice(index, 1)[0];
    saveCurrentSkillsState();
    renderSkillsList();
    showToast(`🗑️ Removed skill "${removed}"`);
}

async function saveCurrentSkillsState() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email) {
        currentUser.skills = [...currentSkillsList];
        setCurrentUser(currentUser);

        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUser.email,
                    skills: [...currentSkillsList]
                })
            });
            const data = await response.json();
            if (data.success && data.user) {
                setCurrentUser(data.user);
            }
        } catch (err) {
            console.warn("Could not save skills to MongoDB server:", err.message);
        }
    }
}

function renderSkillsList() {
    const formContainer = document.getElementById('form-skills-list');
    const displayContainer = document.getElementById('profile-skills-tags');

    const buildSkillsHTML = () => {
        if (!currentSkillsList || currentSkillsList.length === 0) {
            return `<span style="color: #94a3b8; font-size: 0.85rem; font-style: italic;">No skills added yet. Add your first skill above!</span>`;
        }
        return currentSkillsList.map((skill, idx) => `
            <span class="skill-tag-pill">
                <span>${escapeHtml(skill)}</span>
                <span class="skill-action-btns">
                    <button type="button" class="btn-skill-action edit" title="Edit skill" data-idx="${idx}">✏️</button>
                    <button type="button" class="btn-skill-action delete" title="Delete skill" data-idx="${idx}">🗑️</button>
                </span>
            </span>
        `).join('');
    };

    if (formContainer) {
        formContainer.innerHTML = buildSkillsHTML();
    }
    if (displayContainer) {
        displayContainer.innerHTML = buildSkillsHTML();
    }

    [formContainer, displayContainer].forEach(container => {
        if (!container) return;
        container.querySelectorAll('.btn-skill-action.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                handleEditSkill(idx);
            });
        });
        container.querySelectorAll('.btn-skill-action.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                handleDeleteSkill(idx);
            });
        });
    });
}

/* ==========================================
   COURSES & GAP SKILL LEARNING PATHS RENDERER
   ========================================== */

function initDashboardCoursesFilters() {
    const searchInput = document.getElementById('course-search-input');
    const filterPills = document.querySelectorAll('#course-filter-pills .filter-pill');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const activePill = document.querySelector('#course-filter-pills .filter-pill.active');
            const selectedSkill = activePill ? activePill.getAttribute('data-skill') : 'all';
            renderDashboardCourses(selectedSkill, searchInput.value.trim());
        });
    }

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const selectedSkill = pill.getAttribute('data-skill');
            const searchVal = searchInput ? searchInput.value.trim() : '';
            renderDashboardCourses(selectedSkill, searchVal);
        });
    });
}

function renderDashboardCourses(filterSkill = 'all', searchQuery = '') {
    const container = document.getElementById('courses-container');
    if (!container) return;

    let courses = typeof getAllCourses === 'function' ? getAllCourses() : [];

    if (filterSkill !== 'all') {
        courses = courses.filter(c => c.skill.toLowerCase() === filterSkill.toLowerCase());
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        courses = courses.filter(c => 
            c.title.toLowerCase().includes(query) ||
            c.skill.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.category.toLowerCase().includes(query)
        );
    }

    if (courses.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 3rem;">No courses found matching your query. Try searching for CSS, HTML, MongoDB, or Supabase!</p>`;
        return;
    }

    container.innerHTML = '';

    courses.forEach(course => {
        const hasSkill = currentSkillsList.some(s => s.toLowerCase() === course.skill.toLowerCase());

        const card = document.createElement('div');
        card.style.cssText = 'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s ease, border-color 0.2s ease; position: relative;';

        card.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 2rem; background: #f8fafc; padding: 0.5rem; border-radius: 12px; border: 1px solid #e2e8f0;">${course.icon}</span>
                        <div>
                            <span style="background: rgba(99, 102, 241, 0.12); color: ${course.badgeColor}; border: 1px solid ${course.badgeColor}40; padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600;">
                                ${escapeHtml(course.skill)}
                            </span>
                            <span style="font-size: 0.75rem; color: #64748b; margin-left: 0.35rem;">• ${escapeHtml(course.category)}</span>
                        </div>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 600; color: #f59e0b;">⭐ ${course.rating}</span>
                </div>

                <h3 style="font-size: 1.05rem; font-weight: 600; color: #0f172a; margin-bottom: 0.4rem; line-height: 1.3;">
                    ${escapeHtml(course.title)}
                </h3>

                <!-- Price Display in BDT -->
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                    <span style="font-size: 0.78rem; font-weight: 700; color: #4f46e5; background: rgba(79, 70, 229, 0.08); border: 1px solid rgba(79, 70, 229, 0.2); border-radius: 999px; padding: 0.35rem 0.7rem;">
                        ${escapeHtml(course.platform || 'External Platform')}
                    </span>
                </div>

                <p style="font-size: 0.85rem; color: #475569; line-height: 1.5; margin-bottom: 0.85rem;">
                    ${escapeHtml(course.description)}
                </p>

                <div style="display: flex; gap: 0.75rem; font-size: 0.78rem; color: #64748b; background: #f8fafc; padding: 0.5rem 0.75rem; border-radius: 8px; margin-bottom: 0.85rem;">
                    <span>⏱️ ${course.duration}</span>
                    <span>📚 ${course.lessonsCount} Classes</span>
                    <span>📊 ${course.level}</span>
                </div>
            </div>

            <div style="margin-top: 1rem; border-top: 1px dashed #e2e8f0; padding-top: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="btn-view-course-outline" data-id="${course.id}" style="width: 100%; background: rgba(99, 102, 241, 0.1); color: #4f46e5; border: 1px solid rgba(99, 102, 241, 0.3); padding: 0.5rem; border-radius: 8px; font-weight: 600; font-size: 0.82rem; cursor: pointer;">
                    📋 View Course Outline
                </button>
                <button class="btn-enroll-course" data-id="${course.id}" style="width: 100%; background: ${hasSkill ? '#10b981' : 'linear-gradient(135deg, #6366f1, #4f46e5)'}; color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                    ${hasSkill ? '✓ Skill Recommended' : `Open on ${escapeHtml(course.platform || 'Platform')} →`}
                </button>
            </div>
        `;

        container.appendChild(card);

        const outlineBtn = card.querySelector('.btn-view-course-outline');
        const enrollBtn = card.querySelector('.btn-enroll-course');

        const triggerModal = () => {
            if (typeof openCourseDetailsModal === 'function') {
                openCourseDetailsModal(course, () => {
                    syncProfileData();
                    renderDashboardCourses(filterSkill, searchQuery);
                });
            }
        };

        if (outlineBtn) outlineBtn.addEventListener('click', triggerModal);
        if (enrollBtn) enrollBtn.addEventListener('click', triggerModal);
    });
}

