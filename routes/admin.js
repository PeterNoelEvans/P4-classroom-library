const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Book = require('../models/book');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { adminPassword } = req.body;
        
        if (adminPassword !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid admin password' });
        }

        // Create admin token
        const token = jwt.sign(
            { isAdmin: true },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Error during admin login' });
    }
});

// Get all students
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({}).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students' });
    }
});

// Add a new student
router.post('/students', async (req, res) => {
    try {
        const { fullName, nickname, class: studentClass } = req.body;
        
        // Generate a default password (you might want to change this logic)
        const defaultPassword = nickname.toLowerCase().replace(/\s/g, '');
        
        const student = await User.create({
            fullName,
            nickname,
            class: studentClass,
            password: defaultPassword, // This should be hashed in the User model
            booksRead: [],
            readingScore: 0
        });

        // Remove password from response
        const studentResponse = student.toObject();
        delete studentResponse.password;

        res.status(201).json(studentResponse);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Error creating student' });
    }
});

// Delete a student
router.delete('/students/:id', async (req, res) => {
    try {
        const student = await User.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Error deleting student' });
    }
});

// Update a student
router.put('/students/:id', async (req, res) => {
    try {
        const { fullName, nickname, class: studentClass } = req.body;
        const student = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, nickname, class: studentClass },
            { new: true }
        ).select('-password');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json(student);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student' });
    }
});

// Get all books
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find({})
            .sort({ title: 1 });  // Sort alphabetically by title
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Get book popularity report
router.get('/reports/popularity', async (req, res) => {
    try {
        const books = await Book.find()
            .sort({ borrowCount: -1 });
        
        const report = books.map(book => {
            // Calculate average rating from borrowHistory
            const validRatings = book.borrowHistory
                .filter(h => h.affectiveScore)
                .map(h => h.affectiveScore);
            
            const avgRating = validRatings.length > 0 
                ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length 
                : 0;

            return {
                title: book.title,
                borrowCount: book.borrowCount || 0,
                averageRating: avgRating,
                totalReads: book.totalReads || 0,
                assignedClass: book.assignedClass,
                currentStatus: book.currentBorrower ? 'Borrowed' : 'Available',
                totalRatings: validRatings.length
            };
        });

        res.json(report);
    } catch (error) {
        console.error('Error in popularity report:', error);
        res.status(500).json({ message: 'Error generating popularity report' });
    }
});

// Get student reading progress report
router.get('/reports/reading', async (req, res) => {
    try {
        // Get all users with their books
        const users = await User.find();
        console.log('Found users:', users.length);

        const report = await Promise.all(users.map(async user => {
            try {
                if (!user) {
                    console.log('Skipping undefined user');
                    return null;
                }

                console.log('Processing user:', {
                    id: user._id,
                    name: user.fullName,
                    class: user.class
                });

                // Get completed books with ratings
                const completedBooks = await Book.find({
                    'borrowHistory': {
                        $elemMatch: {
                            student: user._id,
                            returnedAt: { $exists: true }
                        }
                    }
                });

                console.log('Found completed books:', completedBooks.length);

                // Calculate ratings
                const ratings = completedBooks.flatMap(book => {
                    if (!book.borrowHistory) return [];
                    return book.borrowHistory
                        .filter(h => 
                            h && h.student && 
                            h.student.toString() === user._id.toString() && 
                            h.returnedAt && 
                            h.affectiveScore
                        )
                        .map(h => h.affectiveScore);
                });

                const averageRating = ratings.length > 0 
                    ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
                    : 0;

                return {
                    fullName: user.fullName || 'Unknown',
                    class: user.class || 'Unknown',
                    booksRead: completedBooks.length,
                    readingScore: user.readingScore || 0,
                    averageRating: averageRating,
                    totalRatings: ratings.length
                };
            } catch (error) {
                console.error('Error processing user:', user?._id, error);
                return null;
            }
        }));

        // Filter out any null entries from errors
        const validReport = report.filter(entry => entry !== null);
        console.log('Final report entries:', validReport.length);

        res.json(validReport);
    } catch (error) {
        console.error('Error generating reading report:', error);
        res.status(500).json({ message: 'Error generating reading report' });
    }
});

// Get class statistics report
router.get('/reports/class', async (req, res) => {
    try {
        // First get all books with their details
        const allBooks = await Book.find({});
        console.log('All books:', allBooks.map(b => ({
            title: b.title,
            class: b.assignedClass || 'N/A'
        })));

        // Group books by class
        const bookStats = await Book.aggregate([
            {
                $group: {
                    _id: { $ifNull: ['$assignedClass', 'N/A'] },  // Show null as N/A
                    totalBooks: { $sum: 1 },
                    bookTitles: { $push: '$title' },  // Collect titles for debugging
                    totalBorrows: { $sum: { $ifNull: ['$borrowCount', 0] } }
                }
            }
        ]);

        // Get user stats by class
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: { $ifNull: ['$class', 'N/A'] },
                    totalReadingScore: { $sum: { $ifNull: ['$readingScore', 0] } },
                    studentCount: { $sum: 1 },
                    readingScores: { $push: '$readingScore' }
                }
            }
        ]);

        // Debug logging
        console.log('Book stats:', bookStats.map(stat => ({
            class: stat._id,
            totalBooks: stat.totalBooks,
            books: stat.bookTitles
        })));

        // Combine and calculate averages
        const stats = bookStats.map(bookStat => {
            const userStat = userStats.find(u => u._id === bookStat._id) || {
                studentCount: 0,
                totalReadingScore: 0,
                readingScores: []
            };

            const borrowsPerStudent = userStat.studentCount > 0 
                ? bookStat.totalBorrows / userStat.studentCount 
                : 0;

            const validScores = userStat.readingScores.filter(score => score != null && score !== 0);
            const averageReadingScore = validScores.length > 0
                ? validScores.reduce((a, b) => a + b, 0) / validScores.length
                : 0;

            console.log(`Class ${bookStat._id} details:`, {
                books: bookStat.bookTitles,
                studentCount: userStat.studentCount,
                totalBorrows: bookStat.totalBorrows,
                borrowsPerStudent,
                totalReadingScore: userStat.totalReadingScore,
                averageReadingScore,
                validScores
            });

            return {
                class: bookStat._id,
                totalBooks: bookStat.totalBooks,
                totalBorrows: bookStat.totalBorrows,
                borrowsPerStudent: parseFloat(borrowsPerStudent.toFixed(1)),
                averageReadingScore: parseFloat(averageReadingScore.toFixed(1)),
                studentCount: userStat.studentCount
            };
        });

        res.json(stats);
    } catch (error) {
        console.error('Error in class stats:', error);
        res.status(500).json({ message: 'Error generating class statistics' });
    }
});

// Add a book
router.post('/books', async (req, res) => {
    try {
        const { title, assignedClass } = req.body;
        
        // Validate class
        if (!['4/1', '4/2'].includes(assignedClass)) {
            return res.status(400).json({ 
                message: 'Invalid class. Must be either "4/1" or "4/2"' 
            });
        }

        const book = await Book.create({
            title,
            assignedClass,
            borrowCount: 0,
            totalReads: 0,
            borrowHistory: [],
            quizQuestions: []
        });

        res.status(201).json(book);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ message: 'Error creating book' });
    }
});

// Add this route to inspect unassigned books
router.get('/books/unassigned', async (req, res) => {
    try {
        const unassignedBooks = await Book.find({
            $or: [
                { assignedClass: null },
                { assignedClass: 'N/A' },
                { assignedClass: { $exists: false } }
            ]
        });

        console.log('Unassigned books:', unassignedBooks.map(b => ({
            id: b._id,
            title: b.title,
            assignedClass: b.assignedClass,
            createdAt: b.createdAt
        })));

        res.json(unassignedBooks);
    } catch (error) {
        console.error('Error fetching unassigned books:', error);
        res.status(500).json({ message: 'Error fetching unassigned books' });
    }
});

module.exports = router; 