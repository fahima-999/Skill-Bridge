const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['seeker', 'recruiter'],
        default: 'seeker'
    },
    targetRole: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    company: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    settings: {
        notifyJobs: { type: Boolean, default: true },
        notifyDigest: { type: Boolean, default: true },
        highContrast: { type: Boolean, default: false },
        autoAdvance: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
