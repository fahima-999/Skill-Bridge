const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: String, required: true },
    topic: { type: String, default: '' }
});

const courseSchema = new mongoose.Schema({
    courseId: {
        type: String,
        required: true,
        unique: true
    },
    skill: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        default: 'General'
    },
    level: {
        type: String,
        default: 'Beginner to Intermediate'
    },
    duration: {
        type: String,
        default: '3.0 Hours'
    },
    lessonsCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4.8
    },
    badgeColor: {
        type: String,
        default: '#38bdf8'
    },
    icon: {
        type: String,
        default: '🎓'
    },
    priceBDT: {
        type: Number,
        default: null
    },
    originalPriceBDT: {
        type: Number,
        default: null
    },
    platform: {
        type: String,
        default: 'Udemy'
    },
    externalLink: {
        type: String,
        default: 'https://www.udemy.com/'
    },
    instructor: {
        type: String,
        default: 'Industry Expert'
    },
    description: {
        type: String,
        default: ''
    },
    outcomes: {
        type: [String],
        default: []
    },
    syllabus: [lessonSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
