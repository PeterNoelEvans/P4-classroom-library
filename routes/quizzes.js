const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Quiz = require('../models/quiz');
const User = require('../models/user');

// Get quiz for a book
router.get('/:bookId', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ book: req.params.bookId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Only send questions without correct answers
        const safeQuiz = {
            _id: quiz._id,
            book: quiz.book,
            questions: quiz.questions.map(q => ({
                question: q.question,
                options: q.options
            })),
            affectiveDomainQuestions: quiz.affectiveDomainQuestions
        };
        
        res.json(safeQuiz);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quiz' });
    }
});

// Submit quiz answers
router.post('/:bookId/submit', protect, async (req, res) => {
    try {
        const { answers, affectiveAnswers } = req.body;
        const quiz = await Quiz.findOne({ book: req.params.bookId });
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate quiz score
        const score = quiz.calculateScore(answers);

        // Calculate average affective score
        const affectiveScore = affectiveAnswers.reduce((sum, score) => sum + score, 0) / affectiveAnswers.length;

        // Update user's quiz record
        const user = await User.findById(req.user._id);
        user.quizzesTaken.push({
            book: req.params.bookId,
            score,
            affectiveScore,
            completedAt: new Date()
        });

        // Update reading score (simple average of all quiz scores)
        const totalQuizzes = user.quizzesTaken.length;
        user.readingScore = user.quizzesTaken.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes;

        await user.save();

        res.json({
            score,
            affectiveScore,
            message: 'Quiz submitted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting quiz' });
    }
});

// Admin routes for managing quizzes
router.post('/', protect, async (req, res) => {
    try {
        const { bookId, questions, affectiveDomainQuestions } = req.body;
        const quiz = await Quiz.create({
            book: bookId,
            questions,
            affectiveDomainQuestions
        });
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Error creating quiz' });
    }
});

router.put('/:id', protect, async (req, res) => {
    try {
        const { questions, affectiveDomainQuestions } = req.body;
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { questions, affectiveDomainQuestions },
            { new: true }
        );
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Error updating quiz' });
    }
});

module.exports = router; 