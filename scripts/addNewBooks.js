require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('../models/book');

async function addNewBooks() {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27018/SchoolLibrary');
        console.log('Connected to MongoDB');

        const classes = ['G4-1', 'G4-2'];
        
        for (const className of classes) {
            const filePath = path.join(__dirname, '..', 'book-lists', `${className}-books.txt`);
            console.log(`\nProcessing ${className} from ${filePath}`);
            
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            // Get existing books for this class
            const classNumber = className.replace('G', '').replace('-', '/');
            const existingBooks = await Book.find({ assignedClass: classNumber });
            const existingTitles = new Set(existingBooks.map(book => book.title.toLowerCase().trim()));

            console.log(`Found ${existingBooks.length} existing books for class ${classNumber}`);
            
            let newCount = 0;
            let skipCount = 0;

            for (const line of lines) {
                const title = line.trim();
                if (!title) continue;

                // Check if book already exists (case-insensitive)
                if (existingTitles.has(title.toLowerCase())) {
                    console.log(`Skipping existing book: "${title}"`);
                    skipCount++;
                    continue;
                }

                try {
                    const book = new Book({
                        title,
                        assignedClass: classNumber,
                        currentBorrower: null,
                        borrowHistory: [],
                        borrowCount: 0,
                        totalReads: 0,
                        averageRating: 0,
                        totalRatings: 0,
                        reviews: []
                    });

                    await book.save();
                    console.log(`Added new book: "${title}"`);
                    newCount++;
                } catch (error) {
                    console.error(`Error adding book "${title}":`, error.message);
                }
            }

            console.log(`\nSummary for ${className}:`);
            console.log(`- Existing books: ${existingBooks.length}`);
            console.log(`- New books added: ${newCount}`);
            console.log(`- Books skipped: ${skipCount}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

addNewBooks(); 