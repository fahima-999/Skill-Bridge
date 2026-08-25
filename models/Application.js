const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        trim: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    applicantName: {
        type: String,
        required: true,
        trim: true
    },
    applicantEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    applicantRole: {
        type: String,
        default: ''
    },
    applicantSkills: {
        type: [String],
        default: []
    },
    coverLetter: {
        type: String,
        default: ''
    },
    cvFileName: {
        type: String,
        required: true
    },
    cvFileData: {
        type: String, // Base64 data URL string or text
        required: true
    },
    cvFileType: {
        type: String,
        default: 'application/pdf'
    },
    status: {
        type: String,
        enum: ['Applied', 'Shortlisted', 'Rejected'],
        default: 'Applied'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
