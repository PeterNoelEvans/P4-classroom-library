require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/book');

async function checkBooks() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27018/SchoolLibrary');
        console.log('Connected to MongoDB');

        // Check books for each class
        for (const classNum of ['4/1', '4/2']) {
            console.log(`\nChecking books for class ${classNum}:`);
            
            const books = await Book.find({ class: classNum });
            console.log(`Found ${books.length} books`);
            
            // Display sample of books and their status
            books.slice(0, 5).forEach(book => {
                console.log({
                    title: book.title,
                    class: book.class,
                    status: book.status,
                    borrowCount: book.borrowCount,
                    averageRating: book.averageRating,
                    _id: book._id
                });
            });

            // Check for potential issues
            const invalidBooks = await Book.find({ 
                $or: [
                    { class: { $nin: ['4/1', '4/2'] } },
                    { status: { $nin: ['available', 'borrowed'] } }
                ]
            });

            if (invalidBooks.length > 0) {
                console.log('\nFound invalid books:', invalidBooks);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkBooks(); 