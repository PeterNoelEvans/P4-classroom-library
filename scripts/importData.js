const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/user');
const Book = require('../models/book');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/SchoolLibrary', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const importData = async () => {
    try {
        // Read student files
        const g41Students = fs.readFileSync(path.join(__dirname, '../student-lists/G4-1-students.txt'), 'utf8').split('\n');
        const g42Students = fs.readFileSync(path.join(__dirname, '../student-lists/G4-2-students.txt'), 'utf8').split('\n');

        // Read book files
        const g41Books = fs.readFileSync(path.join(__dirname, '../book-lists/G4-1-books.txt'), 'utf8').split('\n');
        const g42Books = fs.readFileSync(path.join(__dirname, '../book-lists/G4-2-books.txt'), 'utf8').split('\n');

        // Clear existing data
        await User.deleteMany({});
        await Book.deleteMany({});

        // Import G4/1 students
        console.log('Importing G4/1 students...');
        for (const studentLine of g41Students) {
            if (studentLine.trim()) {
                const [fullName, nickname] = studentLine.split('\t');
                await User.create({
                    fullName: fullName.trim(),
                    nickname: nickname.trim(),
                    class: '4/1',
                    password: 'password123'
                });
            }
        }

        // Import G4/2 students
        console.log('Importing G4/2 students...');
        for (const studentLine of g42Students) {
            if (studentLine.trim()) {
                const [fullName, nickname] = studentLine.split('\t');
                await User.create({
                    fullName: fullName.trim(),
                    nickname: nickname.trim(),
                    class: '4/2',
                    password: 'password123'
                });
            }
        }

        // Import G4/1 books
        console.log('Importing G4/1 books...');
        for (const bookTitle of g41Books) {
            if (bookTitle.trim()) {
                await Book.create({
                    title: bookTitle.trim(),
                    assignedClass: '4/1'
                });
            }
        }

        // Import G4/2 books
        console.log('Importing G4/2 books...');
        for (const bookTitle of g42Books) {
            if (bookTitle.trim()) {
                await Book.create({
                    title: bookTitle.trim(),
                    assignedClass: '4/2'
                });
            }
        }

        console.log('Data import completed successfully');
        
        // Verify import
        const userCount = await User.countDocuments();
        const bookCount = await Book.countDocuments();
        console.log(`Imported ${userCount} users and ${bookCount} books`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
};

importData(); 