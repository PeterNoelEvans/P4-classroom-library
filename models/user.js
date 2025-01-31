const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    booksRead: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    readingScore: {
        type: Number,
        default: 0
    },
    quizzesTaken: [{
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        score: Number,
        affectiveScore: Number,
        completedAt: Date
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User; 