const SVG_ARROW_UP_RIGHT = `<svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`;
const API_BASE_URL = 'http://localhost:5050/api';

document.addEventListener('DOMContentLoaded', () => {
    syncActiveUserWithMongoDB();
    renderNavAuth();
});

// Helper to escape HTML characters for safety
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Toast notification helper
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) {
        alert(message);
        return;
    }

    toastMsg.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

/* ==========================================
   MONGODB AUTHENTICATION & SESSION MANAGEMENT
   ========================================== */

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('skillbridge_current_user')) || null;
    } catch {
        return null;
    }
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('skillbridge_current_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('skillbridge_current_user');
    }
    renderNavAuth();
}

let lastProfileSaveTimestamp = 0;

function notifyProfileUpdated(user) {
    lastProfileSaveTimestamp = Date.now();
    setCurrentUser(user);
    if (typeof syncProfileData === 'function') {
        syncProfileData();
    }
}

// Fetch fresh user data from MongoDB to keep local session updated
async function syncActiveUserWithMongoDB() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) return;

    const fetchStartTime = Date.now();

    try {
        const response = await fetch(`${API_BASE_URL}/users/profile/${encodeURIComponent(currentUser.email)}`);
        const data = await response.json();

        // If a local profile save occurred after this request started, skip stale server data
        if (lastProfileSaveTimestamp > fetchStartTime) {
            console.log("ℹ️ Preserving local fresh updates over stale in-flight sync.");
            return;
        }

        if (data.success && data.user) {
            setCurrentUser(data.user);
            if (typeof syncProfileData === 'function') {
                syncProfileData();
            }
        }
    } catch (err) {
        console.warn("Could not sync with MongoDB server:", err.message);
    }
}

function renderNavAuth() {
    const container = document.getElementById('nav-auth-container');
    if (!container) return;

    const user = getCurrentUser();

    if (user) {
        const isRecruiter = user.role === 'recruiter';
        const displayName = isRecruiter ? (user.company || user.name) : user.name;
        const badgeIcon = isRecruiter ? '🏢' : '👤';
        const badgeClass = isRecruiter ? 'recruiter-bg' : 'seeker-bg';
        const targetPage = isRecruiter ? 'recruiter-hub.html' : 'learner-dashboard.html';
        const buttonLabel = isRecruiter ? 'Recruiter Hub 🏢' : 'Dashboard 📊';

        container.innerHTML = `
            <a href="${targetPage}" id="user-dash-action-btn" class="btn-dashboard">${buttonLabel}</a>
            <div class="user-chip">
                <span class="avatar-badge ${badgeClass}">${badgeIcon}</span>
                <span class="user-chip-name">${escapeHtml(displayName)}</span>
            </div>
            <button id="logout-btn" class="btn btn-nav btn-logout">Logout 🚪</button>
        `;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                setCurrentUser(null);
                showToast("Logged out successfully.");
                window.location.href = 'index.html';
            });
        }
    } else {
        container.innerHTML = `<button id="open-login-btn" class="btn btn-nav">Login ${SVG_ARROW_UP_RIGHT}</button>`;
        const loginBtn = document.getElementById('open-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof showAuthModal === 'function') {
                    showAuthModal('login');
                } else {
                    window.location.href = 'index.html#login';
                }
            });
        }
    }
}
