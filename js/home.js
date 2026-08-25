/* Home Page Interactions */
document.addEventListener('DOMContentLoaded', () => {
    initHomePage();
});

function initHomePage() {
    const heroGetStartedBtn = document.getElementById('hero-get-started-btn');
    if (heroGetStartedBtn) {
        heroGetStartedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUser = getCurrentUser();
            if (currentUser) {
                if (currentUser.role === 'recruiter') {
                    window.location.href = 'recruiter-hub.html';
                } else {
                    window.location.href = 'learner-dashboard.html';
                }
            } else {
                window.location.href = 'jobs.html';
            }
        });
    }
}
