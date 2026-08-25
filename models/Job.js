const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    salary: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        default: 'fullstack'
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    desc: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60'
    },
    postedBy: {
        type: String,
        default: '',
        trim: true,
        lowercase: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);