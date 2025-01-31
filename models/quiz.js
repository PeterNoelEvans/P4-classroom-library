const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,  // Index of the correct option
        required: true
    }
});

const quizSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    questions: [questionSchema],
    affectiveDomainQuestions: [{
        question: String,
        type: {
            type: String,
            enum: ['emoji', 'scale'],
            default: 'emoji'
        }
    }]
}, {
    timestamps: true
});

// Method to calculate score
quizSchema.methods.calculateScore = function(answers) {
    let score = 0;
    answers.forEach((answer, index) => {
        if (index < this.questions.length && answer === this.questions[index].correctAnswer) {
            score++;
        }
    });
    return (score / this.questions.length) * 100;
};

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz; 