const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    assignedClass: {
        type: String,
        required: true,
        enum: ['4/1', '4/2']
    },
    currentBorrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    borrowHistory: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        borrowedAt: Date,
        returnedAt: Date,
        affectiveScore: Number,
        reviewPhoto: {
            data: String,  // Base64 encoded image
            uploadedAt: Date
        }
    }],
    borrowCount: {
        type: Number,
        default: 0
    },
    totalReads: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        affectiveScore: Number,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    quizQuestions: [{
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        correctAnswer: {
            type: Number,  // Index of correct option
            required: true
        }
    }],
    quizResults: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        answers: [{
            questionIndex: Number,
            selectedAnswer: Number,
            isCorrect: Boolean
        }],
        score: Number,
        completedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Virtual for book status
bookSchema.virtual('isAvailable').get(function() {
    return !this.currentBorrower;
});

// Method to update popularity
bookSchema.methods.updatePopularity = function() {
    const totalAffectiveScore = this.reviews.reduce((sum, review) => 
        sum + (review.affectiveScore || 0), 0);
    this.averageRating = (this.totalRatings * 0.4) + 
                     ((totalAffectiveScore / Math.max(1, this.reviews.length)) * 0.3);
    return this.save();
};

const Book = mongoose.model('Book', bookSchema);
module.exports = Book; 