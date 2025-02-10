const express = require('express');
const router = express.Router();
const { protect, checkClass } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');
const Book = require('../models/book');
const User = require('../models/user');

// Get available books for user's class
router.get('/available', protect, async (req, res) => {
    try {
        const books = await Book.find({
            assignedClass: req.user.class,
            currentBorrower: null
        }).sort({ title: 1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Get user's borrowed books
router.get('/borrowed', protect, async (req, res) => {
    try {
        const books = await Book.find({
            currentBorrower: req.user._id
        }).sort({ title: 1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrowed books' });
    }
});

// Borrow a book
router.post('/borrow/:id', protect, async (req, res) => {
    try {
        const book = await Book.findOne({
            _id: req.params.id,
            currentBorrower: null,
            assignedClass: req.user.class
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not available' });
        }

        book.currentBorrower = req.user._id;
        book.borrowHistory.push({
            student: req.user._id,
            borrowedAt: new Date()
        });
        book.borrowCount += 1;
        
        await book.save();
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error borrowing book' });
    }
});

// Return a book
router.post('/return/:id', protect, async (req, res) => {
    try {
        console.log('Return request for book:', req.params.id);
        console.log('User:', req.user._id);
        
        const book = await Book.findOne({
            _id: req.params.id,
            currentBorrower: req.user._id
        });
        
        if (!book) {
            console.log('Book not found or not borrowed by user');
            return res.status(404).json({ message: 'Book not found or not borrowed by you' });
        }

        // Update user's reading record
        const user = await User.findById(req.user._id);
        if (!user.booksRead) user.booksRead = [];
        
        if (!user.booksRead.includes(book._id)) {
            console.log('Adding book to user reading history');
            user.booksRead.push(book._id);
            user.readingScore = (user.readingScore || 0) + 1;
            await user.save();
        }

        // Update book's history
        const lastBorrowIndex = book.borrowHistory.length - 1;
        if (lastBorrowIndex >= 0) {
            book.borrowHistory[lastBorrowIndex].returnedAt = new Date();
            if (req.body.affectiveScore) {
                book.borrowHistory[lastBorrowIndex].affectiveScore = req.body.affectiveScore;
            }
        }

        // Update book status
        book.currentBorrower = null;
        book.totalReads = (book.totalReads || 0) + 1;
        await book.save();

        console.log('Book return completed successfully');
        res.json(book);
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({ message: 'Error returning book: ' + error.message });
    }
});

// Admin routes
router.post('/', protect, async (req, res) => {
    try {
        const { title, assignedClass } = req.body;
        const book = await Book.create({
            title,
            assignedClass
        });
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error creating book' });
    }
});

// Get user's reading history
router.get('/history', protect, async (req, res) => {
    try {
        const books = await Book.find({
            'borrowHistory.student': req.user._id
        }).sort({ title: 1 });

        // Format the history data
        const history = books.map(book => {
            const userBorrows = book.borrowHistory.filter(
                record => record.student.toString() === req.user._id.toString()
            );
            
            return {
                bookId: book._id,
                title: book.title,
                borrows: userBorrows.map(record => ({
                    borrowedAt: record.borrowedAt,
                    returnedAt: record.returnedAt,
                    affectiveScore: record.affectiveScore
                }))
            };
        });

        res.json(history);
    } catch (error) {
        console.error('Error fetching reading history:', error);
        res.status(500).json({ message: 'Error fetching reading history' });
    }
});

// Quiz-related routes
// Get quiz for a book
router.get('/:id/quiz', protect, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // If there are no quiz questions, return empty array
        if (!book.quizQuestions || book.quizQuestions.length === 0) {
            return res.json({ questions: [] });
        }

        res.json({ questions: book.quizQuestions });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
});

// Submit quiz answers (student access)
router.post('/:id/quiz/submit', protect, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const { answers } = req.body;
        const score = answers.reduce((acc, answer, index) => {
            return acc + (answer === book.quizQuestions[index].correctAnswer ? 1 : 0);
        }, 0);

        book.quizResults.push({
            student: req.user._id,
            answers: answers.map((answer, index) => ({
                questionIndex: index,
                selectedAnswer: answer,
                isCorrect: answer === book.quizQuestions[index].correctAnswer
            })),
            score
        });

        await book.save();
        res.json({ score });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting quiz' });
    }
});

// Manage quiz questions (admin access)
router.post('/:id/quiz/manage', adminProtect, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const { question, options, correctAnswer } = req.body;
        book.quizQuestions.push({
            question,
            options,
            correctAnswer
        });

        await book.save();
        res.json(book.quizQuestions);
    } catch (error) {
        console.error('Error adding quiz question:', error);
        res.status(500).json({ message: 'Error adding quiz question' });
    }
});

// Delete quiz question (admin access)
router.delete('/:id/quiz/manage/:questionIndex', adminProtect, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        book.quizQuestions.splice(req.params.questionIndex, 1);
        await book.save();
        
        res.json(book.quizQuestions);
    } catch (error) {
        console.error('Error deleting quiz question:', error);
        res.status(500).json({ message: 'Error deleting quiz question' });
    }
});

// Add review photo
router.post('/:id/review', protect, async (req, res) => {
    try {
        const book = await Book.findOne({
            _id: req.params.id,
            currentBorrower: req.user._id
        });
        
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const lastBorrowIndex = book.borrowHistory.length - 1;
        if (lastBorrowIndex >= 0) {
            book.borrowHistory[lastBorrowIndex].reviewPhoto = {
                data: req.body.reviewPhoto,
                uploadedAt: new Date()
            };
        }

        await book.save();
        res.json({ message: 'Review photo uploaded successfully' });
    } catch (error) {
        console.error('Error uploading review:', error);
        res.status(500).json({ message: 'Error uploading review photo' });
    }
});

// Add debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Query:`, req.query);
    console.log('Headers:', req.headers);
    next();
});

module.exports = router; 