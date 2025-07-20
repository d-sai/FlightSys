const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'student'],
        default: 'student'
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    enrolledCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },
    completedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    badges: [String]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
