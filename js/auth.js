/* ==========================================
   AUTH MODAL & ROLE SELECTION LOGIC (MONGODB INTEGRATED)
   ========================================== */

let globalShowAuthModal = null;

function showAuthModal(initialTab = 'login') {
    if (globalShowAuthModal) {
        globalShowAuthModal(initialTab);
    } else {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthModal();
});

function initAuthModal() {
    const modal = document.getElementById('auth-modal');
    const heroRegisterBtn = document.getElementById('hero-register-btn');
    const modalCloseBtn = document.getElementById('modal-close');

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');

    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    // Social login removed

    if (!modal) return;

    const showModal = (initialTab = 'login') => {
        modal.classList.remove('hidden');
        switchTab(initialTab);
        document.body.style.overflow = 'hidden';
    };

    globalShowAuthModal = showModal;

    const hideModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    const switchTab = (tabName) => {
        if (!tabLogin || !tabRegister || !loginView || !registerView) return;
        if (tabName === 'login') {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginView.classList.add('active');
            registerView.classList.remove('active');
        } else {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerView.classList.add('active');
            loginView.classList.remove('active');
        }
    };

    if (window.location.hash === '#login') {
        showModal('login');
    } else if (window.location.hash === '#register') {
        showModal('register');
    }

    if (heroRegisterBtn) {
        heroRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('register');
        });
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', hideModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            hideModal();
        }
    });

    if (tabLogin) tabLogin.addEventListener('click', () => switchTab('login'));
    if (tabRegister) tabRegister.addEventListener('click', () => switchTab('register'));

    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('register');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('login');
        });
    }

    // REGISTER ROLE SELECTION
    const cardSeeker = document.getElementById('role-card-seeker');
    const cardRecruiter = document.getElementById('role-card-recruiter');
    const hiddenRoleInput = document.getElementById('register-selected-role');

    const groupSeekerSkills = document.getElementById('group-seeker-skills');
    const groupRecruiterCompany = document.getElementById('group-recruiter-company');
    const regSubmitBtn = document.getElementById('reg-submit-btn');

    function setRegisterRole(role) {
        if (!cardSeeker || !cardRecruiter || !hiddenRoleInput) return;
        if (role === 'seeker') {
            cardSeeker.classList.add('active');
            const badgeSeeker = cardSeeker.querySelector('.role-card-badge');
            if (badgeSeeker) badgeSeeker.textContent = 'Selected';

            cardRecruiter.classList.remove('active');
            const badgeRecruiter = cardRecruiter.querySelector('.role-card-badge');
            if (badgeRecruiter) badgeRecruiter.textContent = 'Select';

            hiddenRoleInput.value = 'seeker';
            if (groupSeekerSkills) groupSeekerSkills.classList.remove('hidden');
            if (groupRecruiterCompany) groupRecruiterCompany.classList.add('hidden');
            if (regSubmitBtn) regSubmitBtn.innerHTML = 'Create Job Seeker Account ' + SVG_ARROW_UP_RIGHT;
        } else {
            cardRecruiter.classList.add('active');
            const badgeRecruiter = cardRecruiter.querySelector('.role-card-badge');
            if (badgeRecruiter) badgeRecruiter.textContent = 'Selected';

            cardSeeker.classList.remove('active');
            const badgeSeeker = cardSeeker.querySelector('.role-card-badge');
            if (badgeSeeker) badgeSeeker.textContent = 'Select';

            hiddenRoleInput.value = 'recruiter';
            if (groupRecruiterCompany) groupRecruiterCompany.classList.remove('hidden');
            if (groupSeekerSkills) groupSeekerSkills.classList.add('hidden');
            if (regSubmitBtn) regSubmitBtn.innerHTML = 'Create Recruiter Account ' + SVG_ARROW_UP_RIGHT;
        }
    }

    if (cardSeeker && cardRecruiter) {
        cardSeeker.addEventListener('click', () => setRegisterRole('seeker'));
        cardRecruiter.addEventListener('click', () => setRegisterRole('recruiter'));
    }

    // Toggle Password Visibility
    const setupPasswordToggle = (toggleBtnId, inputId) => {
        const toggleBtn = document.getElementById(toggleBtnId);
        const input = document.getElementById(inputId);
        if (toggleBtn && input) {
            toggleBtn.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }
    };

    setupPasswordToggle('toggle-login-pass', 'login-password');
    setupPasswordToggle('toggle-reg-pass', 'reg-password');

    // Social login removed

    // Forms Submission via MongoDB Backend
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    const user = data.user;
                    setCurrentUser(user);
                    hideModal();
                    showToast(`Welcome back, ${user.name}! Logged in as ${user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}.`);
                    if (user.role === 'recruiter') {
                        window.location.href = 'recruiter-hub.html';
                    } else {
                        window.location.href = 'learner-dashboard.html';
                    }
                } else {
                    showToast(`⚠️ ${data.message || 'Invalid email or password.'}`);
                }
            } catch (err) {
                console.error("Login Error:", err);
                showToast("❌ Unable to connect to backend server. Make sure node server.js is running!");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const role = hiddenRoleInput ? hiddenRoleInput.value : 'seeker';
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const skills = document.getElementById('reg-skills')?.value.trim();
            const company = document.getElementById('reg-company')?.value.trim();

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        role,
                        skills: role === 'seeker' ? skills : undefined,
                        company: role === 'recruiter' ? company : undefined
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    const newUser = data.user;
                    setCurrentUser(newUser);
                    hideModal();
                    showToast(`🎉 Account created & stored in MongoDB! Logged in as ${role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}.`);
                    if (role === 'recruiter') {
                        window.location.href = 'recruiter-hub.html';
                    } else {
                        window.location.href = 'learner-dashboard.html';
                    }
                } else {
                    showToast(`⚠️ ${data.message || 'Registration failed.'}`);
                }
            } catch (err) {
                console.error("Registration Error:", err);
                showToast("❌ Unable to connect to backend server. Make sure node server.js is running!");
            }
        });
    }
}