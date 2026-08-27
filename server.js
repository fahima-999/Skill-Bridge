const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
// (Google OAuth removed) 

const User = require('./models/User');
const Job = require('./models/Job');
const Course = require('./models/Course');
const Application = require('./models/Application');
const { Resend } = require('resend');

// Initialize Resend from environment variable (do NOT commit secrets)
const RESEND_API_KEY = process.env.RESEND_API_KEY || null;
if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY is not set in environment; email sending is disabled.');
}
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const app = express();
const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI || null;
if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not set in environment; database connection will fail.');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Health Check Route
app.get('/', (req, res) => {
    res.json({
        status: 'Server Running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// ==========================================
// USER AUTHENTICATION & PROFILE API ENDPOINTS
// ==========================================

// Register User (MongoDB)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, skills, company } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Account with this email already exists in MongoDB.' });
        }

        const parsedSkills = Array.isArray(skills)
            ? skills
            : (typeof skills === 'string' && skills.trim() ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'seeker',
            company: role === 'recruiter' ? (company || '') : '',
            skills: parsedSkills
        });

        await newUser.save();
        console.log(`👤 User registered in MongoDB: ${newUser.email} (${newUser.role})`);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully in MongoDB',
            user: newUser
        });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
    }
});

// Login User (MongoDB)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        console.log(`🔑 User logged in from MongoDB: ${user.email}`);

        return res.json({
            success: true,
            message: 'Login successful via MongoDB',
            user
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
});

// Google OAuth Routes
// (Google OAuth endpoints removed)

// Get User Profile by Email (MongoDB)
app.get('/api/users/profile/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found in MongoDB.' });
        }
        return res.json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Update User Profile (MongoDB)
app.put('/api/users/profile', async (req, res) => {
    try {
        const { email, name, role, targetRole, location, bio, company, skills } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'User email is required for profile update.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found in MongoDB.' });
        }

        if (name !== undefined) user.name = name;
        if (role !== undefined && ['seeker', 'recruiter'].includes(role)) user.role = role;
        if (targetRole !== undefined) user.targetRole = targetRole;
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;
        if (company !== undefined) user.company = company;
        if (skills !== undefined) {
            user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        await user.save();
        console.log(`📝 User profile updated in MongoDB: ${user.email}`);

        return res.json({
            success: true,
            message: 'Profile updated in MongoDB successfully',
            user
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update profile in MongoDB', error: error.message });
    }
});

// Get All Users (Admin / Debug)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.json({ success: true, count: users.length, users });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// RECRUITER JOB LISTINGS API ENDPOINTS (MONGODB)
// ==========================================

// Get All Jobs (or filter by postedBy recruiter email)
app.get('/api/jobs', async (req, res) => {
    try {
        const { postedBy } = req.query;
        let query = {};
        if (postedBy) {
            query.postedBy = postedBy.toLowerCase().trim();
        }
        const jobs = await Job.find(query).sort({ createdAt: -1 });
        return res.json({ success: true, count: jobs.length, jobs });
    } catch (error) {
        console.error('Fetch Jobs Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch jobs from MongoDB', error: error.message });
    }
});

// Create/Post a New Job
app.post('/api/jobs', async (req, res) => {
    try {
        const { title, company, type, salary, category, skillsRequired, desc, postedBy } = req.body;

        if (!title || !company || !type || !salary) {
            return res.status(400).json({ success: false, message: 'Job title, company, type, and salary are required.' });
        }

        const newJob = new Job({
            title,
            company,
            type,
            salary,
            category: category || 'fullstack',
            skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()).filter(Boolean) : []),
            desc: desc || '',
            postedBy: postedBy ? postedBy.toLowerCase().trim() : ''
        });

        await newJob.save();
        console.log(`🎉 New job published in MongoDB: "${newJob.title}" at ${newJob.company}`);

        return res.status(201).json({
            success: true,
            message: 'Job published successfully in MongoDB',
            job: newJob
        });
    } catch (error) {
        console.error('Create Job Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save job in MongoDB', error: error.message });
    }
});

// Delete a Job Listing
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        const deletedJob = await Job.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({ success: false, message: 'Job listing not found in MongoDB.' });
        }

        console.log(`🗑️ Job deleted from MongoDB: "${deletedJob.title}" (${jobId})`);
        return res.json({ success: true, message: 'Job listing removed from MongoDB', id: jobId });
    } catch (error) {
        console.error('Delete Job Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete job from MongoDB', error: error.message });
    }
});

// ==========================================
// COURSES CATALOGUE API ENDPOINTS (MONGODB)
// ==========================================

// Get All Courses from MongoDB
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: 1 });
        return res.json({ success: true, count: courses.length, courses });
    } catch (error) {
        console.error('Fetch Courses Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch courses from MongoDB', error: error.message });
    }
});

// Get Single Course by ID / courseId from MongoDB
app.get('/api/courses/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const course = await Course.findOne({
            $or: [{ courseId: idParam }, { _id: mongoose.Types.ObjectId.isValid(idParam) ? idParam : null }]
        });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found in MongoDB.' });
        }
        return res.json({ success: true, course });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// JOB APPLICATIONS & CV UPLOAD API ENDPOINTS (MONGODB)
// ==========================================

// Submit Job Application with Candidate Profile & CV File
app.post('/api/applications', async (req, res) => {
    try {
        const {
            jobId,
            jobTitle,
            company,
            applicantName,
            applicantEmail,
            applicantRole,
            applicantSkills,
            coverLetter,
            cvFileName,
            cvFileData,
            cvFileType
        } = req.body;

        if (!jobId || !applicantName || !applicantEmail || !cvFileName || !cvFileData) {
            return res.status(400).json({
                success: false,
                message: 'Job ID, candidate name, email, and CV file are required.'
            });
        }

        const parsedSkills = Array.isArray(applicantSkills)
            ? applicantSkills
            : (typeof applicantSkills === 'string' && applicantSkills ? applicantSkills.split(',').map(s => s.trim()).filter(Boolean) : []);

        const newApplication = new Application({
            jobId: String(jobId),
            jobTitle: jobTitle || 'Job Position',
            company: company || 'Company',
            applicantName,
            applicantEmail: applicantEmail.toLowerCase(),
            applicantRole: applicantRole || 'Job Seeker',
            applicantSkills: parsedSkills,
            coverLetter: coverLetter || '',
            cvFileName,
            cvFileData,
            cvFileType: cvFileType || 'application/pdf',
            status: 'Applied'
        });

        await newApplication.save();
        console.log(`📄 New Application submitted to MongoDB: Candidate "${applicantName}" (${applicantEmail}) applied for Job "${jobTitle}" (${jobId})`);

        return res.status(201).json({
            success: true,
            message: 'Application & CV submitted successfully!',
            application: newApplication
        });
    } catch (error) {
        console.error('Submit Application Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit application to MongoDB',
            error: error.message
        });
    }
});

// Get Candidate Applications (Optionally filter by postedBy recruiter email)
// FIX: previously matched applications by regex-guessing company name from
// the recruiter's email local-part (e.g. "hiring" from hiring@technova.io),
// which almost never matched a real company name and made the recruiter's
// applicant count unreliable / stuck at 0. Now we match strictly and only
// by the job IDs that recruiter actually posted.
app.get('/api/applications', async (req, res) => {
    try {
        const { postedBy } = req.query;
        let query = {};

        if (postedBy) {
            const recruiterEmail = postedBy.toLowerCase().trim();

            // Find all jobs posted by this specific recruiter
            const recruiterJobs = await Job.find({ postedBy: recruiterEmail }).select('_id');
            const recruiterJobIds = recruiterJobs.map(j => String(j._id));

            // No jobs posted yet by this recruiter -> no applications possible.
            // Returning an impossible match keeps the response shape consistent
            // (success + empty array) instead of accidentally returning everyone's apps.
            query = { jobId: { $in: recruiterJobIds } };
        }

        const applications = await Application.find(query).sort({ createdAt: -1 });
        return res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error('Fetch Applications Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch candidate applications from MongoDB',
            error: error.message
        });
    }
});

// Get Applications for a Specific Job ID
app.get('/api/applications/job/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const applications = await Application.find({ jobId: String(jobId) }).sort({ createdAt: -1 });
        return res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Get Applications submitted by a candidate email
app.get('/api/applications/user/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const applications = await Application.find({ applicantEmail: email.toLowerCase() }).sort({ createdAt: -1 });
        return res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Update Application Status (Shortlisted / Rejected / Applied)
app.patch('/api/applications/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const id = req.params.id;

        if (!['Applied', 'Shortlisted', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const updatedApp = await Application.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedApp) {
            return res.status(404).json({ success: false, message: 'Application not found in MongoDB.' });
        }

        console.log(`📌 Candidate application status updated in MongoDB: ${updatedApp.applicantName} -> ${status}`);
        return res.json({ success: true, message: `Status updated to ${status}`, application: updatedApp });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Send email to a candidate using Resend — strictly resolved by Applicant ID.
//
// SECURITY / CORRECTNESS NOTE: this endpoint intentionally IGNORES any email
// address, name, or job title the client might send in the request body.
// The only thing the client provides is the Applicant ID (the Application
// document's _id) in the URL. The recipient email, applicant name, and job
// title are always re-fetched fresh from MongoDB using that ID. This makes
// it impossible to send an email to the wrong applicant because of a stale
// UI row, a previously-selected candidate, or a tampered client payload.
app.post('/api/applications/:id/send-email', async (req, res) => {
    const { id } = req.params;

    // Validate the Applicant ID shape before touching the database.
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'A valid Applicant ID is required.' });
    }

    if (!resend) {
        return res.status(503).json({ success: false, message: 'Email service is not configured on the server (missing RESEND_API_KEY).' });
    }

    try {
        // Look up the applicant strictly by ID — this is the single source of
        // truth for who the email goes to.
        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'No applicant found for this Applicant ID.' });
        }

        const to = application.applicantEmail;
        const applicantName = application.applicantName;
        const jobTitle = application.jobTitle;

        if (!to) {
            return res.status(400).json({ success: false, message: 'This applicant has no email address on file.' });
        }

        const subject = `Congratulations — selected for ${jobTitle || 'the role'}`;

        const html = `<p>Hey ${applicantName || ''},</p>
        <p>we are happy to annouched that you are selected for this role and we looking forward to be interview and continue further progress.</p>
        <p>— Team</p>`;

        const fromAddress = process.env.RESEND_FROM || 'Acme <onboarding@resend.dev>';

        // IMPORTANT: The Resend SDK does NOT throw on API-level failures (invalid recipient,
        // unverified domain, sandbox restrictions, etc). It resolves with { data, error }.
        // We check `result.error` explicitly rather than assuming success.
        const result = await resend.emails.send({
            from: fromAddress,
            to: [to],
            subject,
            text: `Hey ${applicantName || ''},\n\nwe are happy to annouched that you are selected for this role and we looking forward to be interview and continue further progress.\n\n— Team`,
            html
        });

        // Log full resend SDK result for debugging delivery issues
        console.log('Resend send result:', JSON.stringify(result));

        if (result && result.error) {
            console.error(`❌ Resend rejected the email for ${to} (Applicant ID ${id}):`, result.error);

            // Record the failed attempt in this applicant's email history too,
            // so recruiters can see it was tried and didn't go through.
            application.emailHistory.push({
                subject,
                sentTo: to,
                status: 'failed',
                messageId: null,
                error: result.error.message || result.error.name || 'Unknown Resend error'
            });
            await application.save();

            return res.status(502).json({
                success: false,
                message: `Resend could not deliver the email: ${result.error.message || result.error.name || 'Unknown Resend error'}`,
                error: result.error
            });
        }

        const sentData = (result && result.data) || result;
        const messageId = (sentData && (sentData.id || sentData.messageId || sentData.message_id)) || null;

        if (!messageId) {
            // No error object, but also no message id back — treat as failure rather than
            // guessing it succeeded.
            console.error('⚠️ Resend returned no error but no message id either:', result);

            application.emailHistory.push({
                subject,
                sentTo: to,
                status: 'failed',
                messageId: null,
                error: 'Resend did not confirm the email was accepted.'
            });
            await application.save();

            return res.status(502).json({
                success: false,
                message: 'Resend did not confirm the email was accepted. It was not actually sent.',
                data: result
            });
        }

        // Save the successful send against THIS applicant's own document —
        // never a different applicant's — since `application` was loaded by
        // the Applicant ID and its email history is embedded on that same doc.
        application.emailHistory.push({
            subject,
            sentTo: to,
            status: 'sent',
            messageId
        });
        await application.save();

        console.log(`✉️ Email actually accepted by Resend for ${to} (Applicant ID: ${id}, job: ${jobTitle}) messageId=${messageId}`);
        return res.json({ success: true, messageId, sentTo: to, applicantName, data: sentData });
    } catch (err) {
        console.error('Send Email Error:', err);
        return res.status(500).json({ success: false, message: 'Server error sending email', error: err.message });
    }
});

// Get the email history for a specific applicant (by Applicant ID)
app.get('/api/applications/:id/email-history', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'A valid Applicant ID is required.' });
        }

        const application = await Application.findById(id).select('applicantName applicantEmail emailHistory');
        if (!application) {
            return res.status(404).json({ success: false, message: 'No applicant found for this Applicant ID.' });
        }

        return res.json({
            success: true,
            applicantName: application.applicantName,
            applicantEmail: application.applicantEmail,
            emailHistory: application.emailHistory || []
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Seed default jobs if MongoDB database is empty
async function seedDefaultJobs() {
    try {
        const count = await Job.countDocuments();
        if (count === 0) {
            console.log('🌱 Seeding initial sample jobs into MongoDB Atlas...');
            const sampleJobs = [
                {
                    title: 'Full Stack Engineer (Node.js & Supabase)',
                    company: 'Webify Solutions',
                    type: 'Full-time • Remote',
                    salary: '$95,000 - $125,000 / yr',
                    category: 'fullstack',
                    skillsRequired: ['React.js', 'Node.js', 'Supabase', 'MongoDB', 'CSS'],
                    desc: 'Build scalable full-stack applications with React, Supabase realtime backend, and MongoDB document storage.',
                    postedBy: 'recruiter@webify.com'
                },
                {
                    title: 'Frontend UI/UX Specialist',
                    company: 'TechNova Studio',
                    type: 'Full-time • Remote',
                    salary: '$85,000 - $110,000 / yr',
                    category: 'frontend',
                    skillsRequired: ['CSS', 'HTML', 'JavaScript', 'React.js'],
                    desc: 'Design and implement responsive, high-performance web user interfaces with CSS Grid, Flexbox, and HTML5 semantic structure.',
                    postedBy: 'hiring@technova.io'
                },
                {
                    title: 'Backend Database Developer',
                    company: 'DataSync Ltd.',
                    type: 'Full-time • On-site',
                    salary: '$90,000 - $120,000 / yr',
                    category: 'backend',
                    skillsRequired: ['MongoDB', 'Supabase', 'Node.js', 'JavaScript'],
                    desc: 'Architect NoSQL collections in MongoDB and manage relational Postgres schemas with Supabase Row Level Security.',
                    postedBy: 'hr@datasync.com'
                }
            ];
            await Job.insertMany(sampleJobs);
            console.log('✅ Seeded sample jobs with CSS, HTML, MongoDB, Supabase skills!');
        }
    } catch (err) {
        console.warn('⚠️ Seeding jobs failed:', err.message);
    }
}

// Seed all courses into MongoDB at once
async function seedDefaultCourses(force = false) {
    try {
        const count = await Course.countDocuments();
        if (count === 0 || force) {
            if (force) {
                await Course.deleteMany({});
            }
            console.log('🌱 Bulk uploading/seeding all courses into MongoDB Atlas Course table...');
            const initialCourses = [
                {
                    courseId: 'course-css-01',
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
                    courseId: 'course-html-01',
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
                    courseId: 'course-mongodb-01',
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
                    courseId: 'course-supabase-01',
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
                    courseId: 'course-react-01',
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
                    courseId: 'course-nodejs-01',
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
                        { title: 'Lesson 3: Custom Middleware & Input Validation', duration: '35 mins', topic: 'Custom middleware & request sanitization' },
                        { title: 'Lesson 4: JWT Authentication & Protected Routes', duration: '40 mins', topic: 'Signing tokens, HTTP-only cookies & auth middleware' }
                    ]
                },
                {
                    courseId: 'course-js-01',
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
            await Course.insertMany(initialCourses);
            console.log('✅ Bulk uploaded all courses to MongoDB Course collection!');
        }
    } catch (err) {
        console.warn('⚠️ Seeding courses failed:', err.message);
    }
}

// Connect to MongoDB & Start Server
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('===================================================');
        console.log('✅ Successfully connected to MongoDB Atlas!');
        console.log(`📡 Database Name: ${mongoose.connection.name}`);
        console.log('===================================================');
        seedDefaultJobs();
        seedDefaultCourses();
    })
    .catch((error) => {
        console.error('===================================================');
        console.error('❌ MongoDB Connection Failed!');
        console.error('Error Details:', error.message);
        console.error('===================================================');
    });

// Event Listeners for DB Connection State
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB connection lost/disconnected.');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB event error:', err.message);
});

// Start Server
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});