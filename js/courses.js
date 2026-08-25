/* ==========================================
   COURSES CATALOGUE & GAP SKILL LEARNING MODULES
   ========================================== */

const COURSE_DEMO_VIDEO_URLS = {
    css: 'https://www.youtube.com/embed/gICjCjpSg6M?list=PLSNRR4BKcowBkHYYumZffsZ3G52hPqRjc',
    html: 'https://www.youtube.com/embed/vA0OuGnqG-A?list=PLSNRR4BKcowBkHYYumZffsZ3G52hPqRjc',
    mongodb: 'https://www.youtube.com/embed/tLpc9tbFsMQ?list=PLSNRR4BKcowBkHYYumZffsZ3G52hPqRjc',
    supabase: 'https://www.youtube.com/embed/nGbn4TQ7LY0?list=PLSNRR4BKcowBkHYYumZffsZ3G52hPqRjc',
    react: 'https://www.youtube.com/embed/gICjCjpSg6M?list=PLSNRR4BKcowBkHYYumZffsZ3G52hPqRjc',
    node: 'https://www.youtube.com/embed/vA0OuGnqG-A?list=PLSNRR4BKcowBkHYYumZffsZ3G52hPqRjc',
    javascript: 'https://www.youtube.com/embed/tLpc9tbFsMQ?list=PLSNRR4BKcowBkHYYumZffsZ3G52hPqRjc'
};

const SKILLBRIDGE_COURSES = [
    {
        id: 'course-css-01',
        skill: 'CSS',
        title: 'Mastering CSS3, Flexbox & Responsive Design',
        category: 'Frontend Engineering',
        level: 'Beginner to Intermediate',
        duration: '3.5 Hours',
        lessonsCount: 8,
        rating: 4.9,
        badgeColor: '#38bdf8',
        icon: '🎨',
        priceBDT: null,
        originalPriceBDT: null,
        platform: 'Udemy',
        externalLink: 'https://udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/',
        instructor: 'Tanvir Ahmed (Senior UI Architect)',
        demoVideoURL: COURSE_DEMO_VIDEO_URLS.css,
        description: 'Udemy course suggestion for modern CSS layout techniques including Flexbox, CSS Grid, custom properties, animations, and mobile-first responsive architecture.',
        outcomes: [
            'Master CSS Flexbox and CSS Grid layout algorithms',
            'Build mobile-first responsive interfaces using media queries',
            'Create smooth UI micro-animations and keyframe transitions',
            'Implement dark mode and glassmorphism styling design systems'
        ],
        syllabus: [
            { title: 'Lesson 1: CSS Box Model & Display Properties', duration: '20 mins', topic: 'Margin, padding, border-box, block vs inline display modes' },
            { title: 'Lesson 2: Flexbox Deep Dive & Layout Patterns', duration: '35 mins', topic: 'Flex direction, justify-content, align-items, flex-grow & shrink' },
            { title: 'Lesson 3: CSS Grid for Modern Page Layouts', duration: '40 mins', topic: 'Grid template columns, areas, auto-fit, auto-fill & minmax()' },
            { title: 'Lesson 4: Custom Properties (CSS Variables)', duration: '25 mins', topic: 'Defining root variables, dynamic theme switching & scoping' },
            { title: 'Lesson 5: Media Queries & Mobile-First Design', duration: '30 mins', topic: 'Responsive breakpoints, fluid typography & viewport units' },
            { title: 'Lesson 6: Keyframe Animations & Smooth Transitions', duration: '30 mins', topic: 'Transformations (scale, rotate), cubic-bezier easing & keyframes' },
            { title: 'Lesson 7: Glassmorphism & Modern Styling Trends', duration: '20 mins', topic: 'Backdrop-filter, subtle borders, box shadows & glowing effects' },
            { title: 'Lesson 8: Hands-on Project: Responsive Dashboard UI', duration: '30 mins', topic: 'Building a complete, production-ready dashboard interface' }
        ]
    },
    {
        id: 'course-html-01',
        skill: 'HTML',
        title: 'Semantic HTML5 & Web Accessibility (WCAG)',
        category: 'Frontend Engineering',
        level: 'Beginner',
        duration: '2.0 Hours',
        lessonsCount: 5,
        rating: 4.8,
        badgeColor: '#f97316',
        icon: '🌐',
        priceBDT: null,
        originalPriceBDT: null,
        platform: 'Udemy',
        externalLink: 'https://udemy.com/course/the-complete-guide-to-html/',
        instructor: 'Faria Rahaman (Frontend Accessibility Lead)',
        demoVideoURL: COURSE_DEMO_VIDEO_URLS.html,
        description: 'Udemy course suggestion for semantic HTML5, web accessibility, forms validation, and ARIA standards.',
        outcomes: [
            'Structure web content using semantic HTML5 tags',
            'Implement web accessibility (WCAG 2.1) & ARIA attributes',
            'Create robust HTML forms with native browser validations',
            'Optimize HTML markup for search engine crawlers (SEO)'
        ],
        syllabus: [
            { title: 'Lesson 1: HTML5 Document Structure & Metadata', duration: '15 mins', topic: '<head> tags, meta viewport, title tags & OpenGraph metadata' },
            { title: 'Lesson 2: Semantic Elements (<main>, <article>, <nav>)', duration: '25 mins', topic: 'Landmark elements, heading hierarchy & document outline' },
            { title: 'Lesson 3: Advanced Web Forms & Native Validation', duration: '30 mins', topic: 'Input types, pattern matching, fieldsets & custom error messages' },
            { title: 'Lesson 4: Accessible Rich Internet Applications (ARIA)', duration: '25 mins', topic: 'ARIA roles, states, live regions & screen reader testing' },
            { title: 'Lesson 5: SEO Best Practices & Audio/Video Tags', duration: '25 mins', topic: 'Structured microdata, alt tags & HTML5 media players' }
        ]
    },
    {
        id: 'course-mongodb-01',
        skill: 'MongoDB',
        title: 'MongoDB Essentials & Mongoose Data Modeling',
        category: 'Backend & Database Architecture',
        level: 'Intermediate',
        duration: '4.0 Hours',
        lessonsCount: 10,
        rating: 4.9,
        badgeColor: '#10b981',
        icon: '🍃',
        priceBDT: null,
        originalPriceBDT: null,
        platform: 'Udemy',
        externalLink: 'https://www.udemy.com/courses/search/?q=mongodb%20mongoose%20nodejs',
        instructor: 'Mahmudul Hasan (Lead Database Engineer)',
        demoVideoURL: COURSE_DEMO_VIDEO_URLS.mongodb,
        description: 'Udemy course suggestion for NoSQL document databases, CRUD operations, MongoDB Atlas setup, and Mongoose ORM integration with Node.js.',
        outcomes: [
            'Design high-performance NoSQL document schema models',
            'Connect and configure MongoDB Atlas cloud database clusters',
            'Execute complex MongoDB aggregation pipelines',
            'Integrate Mongoose ORM schemas & validation in Express REST APIs'
        ],
        syllabus: [
            { title: 'Lesson 1: Introduction to NoSQL & Document Storage', duration: '20 mins', topic: 'JSON/BSON data format, SQL vs NoSQL comparison' },
            { title: 'Lesson 2: Setting up MongoDB Atlas Cloud Database', duration: '25 mins', topic: 'Cluster provisioning, database users & network access IP whitelisting' },
            { title: 'Lesson 3: MongoDB Shell & Basic CRUD Operations', duration: '30 mins', topic: 'insertOne, find, updateOne, deleteMany query operators' },
            { title: 'Lesson 4: Mongoose Schemas, Models & Validation', duration: '35 mins', topic: 'Defining schema types, required constraints & custom validators' },
            { title: 'Lesson 5: Query Filters, Projection & Sorting', duration: '25 mins', topic: 'Comparison ($gt, $in) & logical ($and, $or) query operators' },
            { title: 'Lesson 6: Document Relationships (Embedding vs Referencing)', duration: '30 mins', topic: 'Subdocuments vs Mongoose ObjectId population' },
            { title: 'Lesson 7: MongoDB Aggregation Pipeline Basics', duration: '40 mins', topic: '$match, $group, $project, $lookup & $unwind stages' },
            { title: 'Lesson 8: Indexing for High-Performance Queries', duration: '20 mins', topic: 'Single field, compound & text indexes for speed optimization' },
            { title: 'Lesson 9: Security & Connection Pooling', duration: '20 mins', topic: 'Encryption at rest, TLS connections & connection management' },
            { title: 'Lesson 10: Building a Full REST API with Express & Mongoose', duration: '45 mins', topic: 'Complete CRUD API server implementation' }
        ]
    },
    {
        id: 'course-supabase-01',
        skill: 'Supabase',
        title: 'Building Full-Stack Apps with Supabase & Postgres',
        category: 'Backend & Cloud Infrastructure',
        level: 'Intermediate',
        duration: '4.5 Hours',
        lessonsCount: 9,
        rating: 4.95,
        badgeColor: '#34d399',
        icon: '⚡',
        priceBDT: null,
        originalPriceBDT: null,
        platform: 'Coursera',
        externalLink: 'https://www.coursera.org/search?query=artificial+intelligence',
        instructor: 'Sabbir Hossain (Full Stack Cloud Architect)',
        demoVideoURL: COURSE_DEMO_VIDEO_URLS.supabase,
        description: 'Coursera course suggestion for AI and related modern technology topics to expand your learning path.',
        outcomes: [
            'Manage relational PostgreSQL databases using Supabase Studio',
            'Secure database tables with SQL Row Level Security (RLS) policies',
            'Implement user authentication with OAuth and magic links',
            'Subscribe to realtime database changes via WebSockets'
        ],
        syllabus: [
            { title: 'Lesson 1: Introduction to Supabase & Postgres Fundamentals', duration: '25 mins', topic: 'Supabase ecosystem, Postgres tables & SQL console' },
            { title: 'Lesson 2: Creating Tables, Foreign Keys & Indexes', duration: '30 mins', topic: 'Relational data modeling, CASCADE delete & primary keys' },
            { title: 'Lesson 3: Supabase JS Client & Authentication Flow', duration: '35 mins', topic: 'Client initialization, signup, login & session persistence' },
            { title: 'Lesson 4: Securing Data with Row Level Security (RLS)', duration: '40 mins', topic: 'Creating SQL policies using auth.uid() & role checks' },
            { title: 'Lesson 5: Realtime Database Subscriptions & WebSockets', duration: '35 mins', topic: 'Subscribing to INSERT, UPDATE & DELETE channel events' },
            { title: 'Lesson 6: File Storage Buckets & Media Management', duration: '25 mins', topic: 'Creating public/private buckets & uploading user avatars' },
            { title: 'Lesson 7: Edge Functions & Serverless API Routes', duration: '35 mins', topic: 'Writing Deno TypeScript edge functions for backend logic' },
            { title: 'Lesson 8: Database Migrations & Environment Setup', duration: '25 mins', topic: 'Supabase CLI workflow, local development & staging' },
            { title: 'Lesson 9: Building a Realtime Chat & Task App', duration: '50 mins', topic: 'Building a collaborative live web application' }
        ]
    },
    {
        id: 'course-react-01',
        skill: 'React.js',
        title: 'React 18 & Modern State Management',
        category: 'Frontend Engineering',
        level: 'Intermediate',
        duration: '5.0 Hours',
        lessonsCount: 12,
        rating: 4.85,
        badgeColor: '#60a5fa',
        icon: '⚛️',
        priceBDT: null,
        originalPriceBDT: null,
        platform: 'Udemy',
        externalLink: 'https://udemy.com/course/the-ultimate-react-course/',
        instructor: 'Alex Rivera (React Core Specialist)',
        description: 'Udemy course suggestion for JSX, functional components, hooks, context, and async data fetching.',
        outcomes: [
            'Build interactive Single Page Applications (SPA) with React 18',
            'Master React Hooks lifecycle and custom hook creation',
            'Manage complex global state using Context API and Redux',
            'Optimize render performance with React.memo and useCallback'
        ],
        syllabus: [
            { title: 'Lesson 1: React Fundamentals & Virtual DOM', duration: '25 mins', topic: 'JSX syntax, component trees & Virtual DOM reconciliation' },
            { title: 'Lesson 2: State & Props Management', duration: '30 mins', topic: 'Unidirectional data flow, props validation & state immutability' },
            { title: 'Lesson 3: Mastering React Hooks', duration: '45 mins', topic: 'useState, useEffect dependency arrays & useRef for DOM access' },
            { title: 'Lesson 4: Building Reusable Component Libraries', duration: '40 mins', topic: 'Design tokens, compound components & prop getters' }
        ]
    },
    {
        id: 'course-nodejs-01',
        skill: 'Node.js',
        title: 'Backend API Development with Node.js & Express',
        category: 'Backend Engineering',
        level: 'Intermediate',
        duration: '4.2 Hours',
        lessonsCount: 9,
        rating: 4.88,
        badgeColor: '#22c55e',
        icon: '🟢',
        priceBDT: null,
        originalPriceBDT: null,
        platform: 'Udemy',
        externalLink: 'https://udemy.com/course/become-a-java-full-stack-developer-with-react-spring-boot/',
        instructor: 'Imran Nazir (Backend Infrastructure Lead)',
        description: 'Udemy course suggestion for full-stack Java development with React and Spring Boot.',
        outcomes: [
            'Build asynchronous REST APIs using Express.js framework',
            'Implement JWT token authentication & role authorization',
            'Handle stream uploads and file system I/O operations',
            'Deploy Node.js services to cloud containers'
        ],
        syllabus: [
            { title: 'Lesson 1: Node.js Event Loop & Non-Blocking I/O', duration: '25 mins', topic: 'Single-threaded architecture, event loop phases & libuv' },
            { title: 'Lesson 2: Express Server Setup & Routing', duration: '30 mins', topic: 'Express app routing, req/res objects & route parameters' },
            { title: 'Lesson 3: Custom Middleware & Input Validation', duration: '35 mins', topic: 'Global error handling middleware & request sanitization' },
            { title: 'Lesson 4: JWT Authentication & Protected Routes', duration: '40 mins', topic: 'Signing tokens, HTTP-only cookies & auth middleware' }
        ]
    },
    {
        id: 'course-js-01',
        skill: 'JavaScript',
        title: 'Advanced JavaScript ES6+ & Async Programming',
        category: 'Frontend & Core JS',
        level: 'Intermediate',
        duration: '4.0 Hours',
        lessonsCount: 8,
        rating: 4.9,
        badgeColor: '#facc15',
        icon: '🟨',
        priceBDT: null,
        originalPriceBDT: null,
        platform: 'Programming Hero',
        externalLink: 'https://web.programming-hero.com/home',
        instructor: 'Nusrat Jahan (Senior Web Engineer)',
        description: 'Programming Hero course suggestion for JavaScript fundamentals, ES6+, async patterns, and modern web development.',
        outcomes: [
            'Understand JS execution context, call stack, and scope chains',
            'Master asynchronous JS with Promises and async/await syntax',
            'Utilize functional programming patterns (map, filter, reduce)',
            'Write clean ES6+ modular JavaScript code'
        ],
        syllabus: [
            { title: 'Lesson 1: Scope, Hoisting & Closures', duration: '30 mins', topic: 'Lexical scope, closure memory retention & module pattern' },
            { title: 'Lesson 2: Promises & Async/Await In-Depth', duration: '40 mins', topic: 'Promise chaining, Promise.all, error handling with try/catch' },
            { title: 'Lesson 3: Functional Array Methods (map, filter, reduce)', duration: '30 mins', topic: 'Immutable array operations & data transformations' },
            { title: 'Lesson 4: ES Modules & Imports/Exports', duration: '20 mins', topic: 'Default vs named exports, dynamic imports & tree shaking' }
        ]
    }
];

let dynamicMongoCourses = [];

async function fetchCoursesFromMongoDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        const data = await response.json();
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
            dynamicMongoCourses = data.courses.map(c => ({
                id: c.courseId || c._id,
                skill: c.skill,
                title: c.title,
                category: c.category,
                level: c.level,
                duration: c.duration,
                lessonsCount: c.lessonsCount || (c.syllabus ? c.syllabus.length : 0),
                rating: c.rating,
                badgeColor: c.badgeColor,
                icon: c.icon,
                priceBDT: c.priceBDT,
                originalPriceBDT: c.originalPriceBDT,
                instructor: c.instructor,
                description: c.description,
                outcomes: c.outcomes,
                syllabus: c.syllabus
            }));
            return dynamicMongoCourses;
        }
    } catch (err) {
        console.warn("Could not fetch courses from MongoDB API, using local fallback dataset:", err.message);
    }
    return SKILLBRIDGE_COURSES;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCoursesFromMongoDB();
});

// Helper to get course by ID or skill match (case-insensitive)
function getCourseById(courseId) {
    if (!courseId) return null;
    const id = String(courseId).trim();
    return getAllCourses().find(c => String(c.id) === id || String(c._id || '') === id);
}

function getCourseForSkill(skillName) {
    if (!skillName) return null;
    const cleanSkill = skillName.trim().toLowerCase();
    const courses = getAllCourses();
    
    return courses.find(c => {
        const cSkill = c.skill.toLowerCase();
        if (cSkill === cleanSkill) return true;
        if (cleanSkill.includes(cSkill) || cSkill.includes(cleanSkill)) return true;
        if (cleanSkill === 'css3' && cSkill === 'css') return true;
        if (cleanSkill === 'html5' && cSkill === 'html') return true;
        if (cleanSkill === 'mongo' && cSkill === 'mongodb') return true;
        if (cleanSkill === 'supabase.io' && cSkill === 'supabase') return true;
        if ((cleanSkill === 'react' || cleanSkill === 'reactjs') && cSkill === 'react.js') return true;
        if ((cleanSkill === 'node' || cleanSkill === 'nodejs') && cSkill === 'node.js') return true;
        if (cleanSkill === 'js' && cSkill === 'javascript') return true;
        return false;
    });
}

function getCourseDemoVideo(course) {
    if (!course) return COURSE_DEMO_VIDEO_URLS.css;

    const key = String(course.skill || '').trim().toLowerCase();
    const normalizedKey = key.replace(/\./g, '').replace(/js$/i, 'javascript');
    return course.demoVideoURL || COURSE_DEMO_VIDEO_URLS[normalizedKey] || COURSE_DEMO_VIDEO_URLS.css;
}

// Get all courses
function getAllCourses() {
    return dynamicMongoCourses.length > 0 ? dynamicMongoCourses : SKILLBRIDGE_COURSES;
}

/* ==========================================
   UNIVERSAL COURSE DETAILS & ENROLLMENT MODAL
   ========================================== */

function openCourseDetailsModal(courseOrId, onEnrolledCallback) {
    let course = null;
    if (typeof courseOrId === 'string') {
        course = getCourseById(courseOrId) || getCourseForSkill(courseOrId);
    } else {
        course = courseOrId;
    }

    if (!course) {
        if (typeof showToast === 'function') showToast("⚠️ Course details not found.");
        return;
    }

    // Ensure modal container exists in DOM
    let modal = document.getElementById('course-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'course-details-modal';
        modal.className = 'modal-overlay hidden';
        document.body.appendChild(modal);
    }

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const userSkills = currentUser && Array.isArray(currentUser.skills) ? currentUser.skills.map(s => s.toLowerCase()) : [];
    const isAlreadyEnrolled = userSkills.includes(course.skill.toLowerCase());

    const platformLabel = course.platform || 'Learning platform';
    const externalLink = course.externalLink || 'https://www.udemy.com/';

    const syllabusHTML = course.syllabus.map((lesson, idx) => `
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 0.85rem 1rem; margin-bottom: 0.6rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <span style="font-size: 0.88rem; font-weight: 600; color: #f8fafc;">
                    <span style="color: ${course.badgeColor}; margin-right: 0.35rem;">Class ${idx + 1}:</span> ${escapeHtml(lesson.title)}
                </span>
                <span style="font-size: 0.75rem; background: rgba(255, 255, 255, 0.1); color: #94a3b8; padding: 0.2rem 0.55rem; border-radius: 99px;">
                    ⏱️ ${escapeHtml(lesson.duration)}
                </span>
            </div>
            <p style="font-size: 0.8rem; color: #94a3b8; margin: 0; line-height: 1.4;">
                ${escapeHtml(lesson.topic || 'In-depth interactive practical lesson & code walkthrough.')}
            </p>
        </div>
    `).join('');

    const outcomesHTML = (course.outcomes || []).map(o => `
        <li style="font-size: 0.85rem; color: #cbd5e1; display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span style="color: #10b981; font-weight: bold;">✓</span>
            <span>${escapeHtml(o)}</span>
        </li>
    `).join('');

    modal.innerHTML = `
        <div class="modal-card" style="max-width: 720px; width: 92%; max-height: 88vh; overflow-y: auto; background: #0f172a; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 20px; padding: 2rem; color: #f8fafc; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <button id="close-course-details-btn" class="modal-close-btn" aria-label="Close modal" style="top: 1.25rem; right: 1.25rem; color: #94a3b8; font-size: 1.5rem;">&times;</button>
            
            <!-- Course Header -->
            <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem;">
                <span style="font-size: 2.5rem; background: rgba(255,255,255,0.06); padding: 0.75rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">${course.icon}</span>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.35rem;">
                        <span style="background: rgba(99, 102, 241, 0.2); color: ${course.badgeColor}; border: 1px solid ${course.badgeColor}40; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.8rem; font-weight: 600;">
                            ${escapeHtml(course.skill)} Course
                        </span>
                        <span style="font-size: 0.8rem; color: #94a3b8;">${escapeHtml(course.category)}</span>
                        <span style="font-size: 0.8rem; color: #f59e0b; font-weight: 600;">⭐ ${course.rating}</span>
                    </div>
                    <h2 style="font-size: 1.4rem; font-weight: 700; color: #ffffff; margin: 0 0 0.4rem 0; line-height: 1.3;">
                        ${escapeHtml(course.title)}
                    </h2>
                    <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">
                        👨‍🏫 Instructor: <strong style="color: #e2e8f0;">${escapeHtml(course.instructor || 'Senior Industry Expert')}</strong>
                    </p>
                </div>
            </div>

            <!-- Platform Suggestion Banner -->
            <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9)); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <span style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Course Recommendation</span>
                    <div style="display: flex; align-items: baseline; gap: 0.75rem; margin-top: 0.2rem; flex-wrap: wrap;">
                        <span style="font-size: 1.35rem; font-weight: 800; color: #38bdf8;">${escapeHtml(platformLabel)}</span>
                    </div>
                </div>
                <div style="font-size: 0.8rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.2rem;">
                    <span>⏱️ Duration: <strong>${course.duration}</strong> (${course.lessonsCount} Classes)</span>
                    <span>🎓 Platform: <strong>${escapeHtml(platformLabel)}</strong></span>
                </div>
            </div>

            <!-- Description & Outcomes -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="font-size: 0.98rem; font-weight: 600; color: #818cf8; margin-bottom: 0.5rem;">About This Course</h4>
                <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 0.85rem;">
                    ${escapeHtml(course.description)}
                </p>

                ${outcomesHTML ? `
                    <h4 style="font-size: 0.95rem; font-weight: 600; color: #818cf8; margin-bottom: 0.5rem;">Key Learning Outcomes</h4>
                    <ul style="list-style: none; padding-left: 0; margin-bottom: 1.25rem;">
                        ${outcomesHTML}
                    </ul>
                ` : ''}
            </div>

            <!-- Full Syllabus Breakdown -->
            <div style="margin-bottom: 1.75rem;">
                <h4 style="font-size: 0.98rem; font-weight: 600; color: #818cf8; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>📚</span> Full Course Outline (${course.lessonsCount} Classes)
                </h4>
                <div style="max-height: 260px; overflow-y: auto; padding-right: 0.25rem;">
                    ${syllabusHTML}
                </div>
            </div>

            <!-- Action Footer -->
            <div style="display: flex; gap: 0.85rem; align-items: center; justify-content: flex-end; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.25rem;">
                <button id="btn-close-course-details" class="btn btn-outline" style="min-width: 100px; justify-content: center;">
                    Close
                </button>
                <button id="btn-confirm-course-enroll" class="btn btn-dark" style="flex: 1; min-width: 240px; justify-content: center; background: linear-gradient(135deg, #38bdf8, #6366f1); color: white; padding: 0.75rem 1.25rem; font-size: 0.95rem; font-weight: 700; border-radius: 10px; border: none; cursor: pointer;">
                    Open on ${escapeHtml(platformLabel)} →
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    const closeBtn = document.getElementById('close-course-details-btn');
    const closeBtnAlt = document.getElementById('btn-close-course-details');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnAlt) closeBtnAlt.addEventListener('click', closeModal);

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    const enrollBtn = document.getElementById('btn-confirm-course-enroll');
    if (enrollBtn) {
        enrollBtn.addEventListener('click', () => {
            closeModal();
            window.open(externalLink, '_blank', 'noopener,noreferrer');
            if (typeof showToast === 'function') {
                showToast(`🔗 Opening ${platformLabel} course suggestion in a new tab.`);
            }
            if (typeof onEnrolledCallback === 'function') {
                onEnrolledCallback(course);
            }
        });
    }
}
