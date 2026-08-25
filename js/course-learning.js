document.addEventListener('DOMContentLoaded', () => {
    initCourseLearningPage();
});

function initCourseLearningPage() {
    const backBtn = document.getElementById('back-to-courses');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'learner-dashboard.html#courses';
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    const course = getCourseById(courseId) || getCourseForSkill(courseId) || getAllCourses()[0];

    if (!course) {
        showToast('⚠️ Course details are unavailable.');
        return;
    }

    renderCourseShell(course);
    attachVideoControls();
}

function renderCourseShell(course) {
    window.currentCourse = course;

    const titleEl = document.getElementById('course-title');
    const badgeEl = document.getElementById('course-badge');
    const metaEl = document.getElementById('course-meta');
    const topicsEl = document.getElementById('course-topics');
    const lessonCountBadge = document.getElementById('lesson-count-badge');
    const activeLessonTitle = document.getElementById('active-lesson-title');
    const lessonTopic = document.getElementById('lesson-topic');
    const lessonActions = document.getElementById('lesson-actions');
    const progressText = document.getElementById('progress-percent');

    if (titleEl) titleEl.textContent = course.title;
    if (badgeEl) {
        badgeEl.textContent = `${course.skill || 'Course'} • ${course.level || 'Learning'}`;
        badgeEl.style.background = course.badgeColor ? `${course.badgeColor}1A` : '#e2e8f0';
        badgeEl.style.color = course.badgeColor || '#0f172a';
        badgeEl.style.borderColor = course.badgeColor ? `${course.badgeColor}55` : '#cbd5e1';
    }

    if (metaEl) {
        metaEl.textContent = `${course.duration || 'Flexible'} • ${course.lessonsCount || (course.syllabus ? course.syllabus.length : 0)} classes • ${course.instructor || 'Expert mentor'}`;
    }

    const syllabus = Array.isArray(course.syllabus) && course.syllabus.length ? course.syllabus : [
        { title: 'Lesson 1: Core Concepts', duration: '20 mins', topic: 'Learn the building blocks and fast implementation patterns.' },
        { title: 'Lesson 2: Guided Practice', duration: '30 mins', topic: 'Apply the lessons in a hands-on exercise and review the solution.' }
    ];

    if (lessonCountBadge) lessonCountBadge.textContent = syllabus.length;

    topicsEl.innerHTML = syllabus.map((lesson, index) => `
        <button class="topic-item ${index === 0 ? 'active' : ''}" data-index="${index}">
            <span class="topic-order">0${index + 1}</span>
            <span class="topic-copy">
                <strong>${escapeHtml(lesson.title)}</strong>
                <small>${escapeHtml(lesson.duration)}</small>
            </span>
        </button>
    `).join('');

    const topicButtons = topicsEl.querySelectorAll('.topic-item');
    topicButtons.forEach((button) => {
        button.addEventListener('click', () => {
            topicButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const index = Number(button.dataset.index);
            updateLessonPanel(syllabus[index], index, syllabus.length);
        });
    });

    const firstLesson = syllabus[0];
    updateLessonPanel(firstLesson, 0, syllabus.length);

    if (progressText) {
        progressText.textContent = '25%';
    }
}

function updateLessonPanel(lesson, index, totalLessons) {
    const activeLessonTitle = document.getElementById('active-lesson-title');
    const lessonTopic = document.getElementById('lesson-topic');
    const lessonActions = document.getElementById('lesson-actions');
    const progressText = document.getElementById('progress-percent');

    if (activeLessonTitle) {
        activeLessonTitle.textContent = `Class ${index + 1}: ${lesson.title || 'Learning lesson'}`;
    }

    if (lessonTopic) {
        lessonTopic.textContent = lesson.topic || 'This lesson focuses on practical implementation and real-world examples.';
    }

    if (lessonActions) {
        const sampleTasks = [
            'Break down the core concept into a simple project example.',
            'Follow the code walkthrough and identify the key implementation steps.',
            'Apply the patterns in a mini exercise to reinforce the lesson.'
        ];

        lessonActions.innerHTML = sampleTasks.map(task => `<li>${escapeHtml(task)}</li>`).join('');
    }

    if (progressText) {
        const completion = Math.max(15, Math.min(95, ((index + 1) / Math.max(totalLessons, 1)) * 100));
        progressText.textContent = `${Math.round(completion)}%`;
    }

    const demoVideo = document.getElementById('demo-video');
    const videoOverlay = document.getElementById('video-overlay');

    if (demoVideo) {
        const embedUrl = getCourseDemoVideo(window.currentCourse || null);
        demoVideo.src = embedUrl;

        if (videoOverlay) {
            videoOverlay.classList.remove('hidden');
        }
    }
}

function attachVideoControls() {
    const playBtn = document.getElementById('play-demo-btn');
    const video = document.getElementById('demo-video');
    const overlay = document.getElementById('video-overlay');

    if (!video || !playBtn || !overlay) return;

    playBtn.addEventListener('click', () => {
        const currentSrc = video.src;
        if (currentSrc && currentSrc.includes('youtube.com/embed/')) {
            const autoplayUrl = currentSrc.includes('autoplay=1') ? currentSrc : `${currentSrc}${currentSrc.includes('?') ? '&' : '?'}autoplay=1`;
            video.src = autoplayUrl;
        }
        overlay.classList.add('hidden');
    });
}
