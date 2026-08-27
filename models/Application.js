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
    },
    // Audit trail of every email sent to this applicant. Always populated
    // server-side from this same document's applicantEmail — never from
    // client input — so history can't be mixed up between candidates.
    emailHistory: {
        type: [{
            subject: { type: String, default: '' },
            sentTo: { type: String, default: '' },
            status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
            messageId: { type: String, default: null },
            error: { type: String, default: null },
            sentAt: { type: Date, default: Date.now }
        }],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);