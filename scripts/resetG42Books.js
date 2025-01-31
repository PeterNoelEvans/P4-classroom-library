require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('../models/book');

async function resetG42Books() {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27018/SchoolLibrary');
        console.log('Connected to MongoDB');

        // Delete only G4-2 books
        const deleteResult = await Book.deleteMany({ assignedClass: '4/2' });
        console.log(`Deleted ${deleteResult.deletedCount} existing G4-2 books`);

        // Read and import new G4-2 books
        const filePath = path.join(__dirname, '..', 'book-lists', 'G4-2-books.txt');
        console.log(`\nProcessing new books from ${filePath}`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        let addedCount = 0;

        for (const line of lines) {
            const title = line.trim();
            if (!title) continue;

            try {
                const book = new Book({
                    title,
                    assignedClass: '4/2',
                    currentBorrower: null,
                    borrowHistory: [],
                    borrowCount: 0,
                    totalReads: 0,
                    averageRating: 0,
                    totalRatings: 0,
                    reviews: []
                });

                await book.save();
                console.log(`Added: "${title}"`);
                addedCount++;
            } catch (error) {
                console.error(`Error adding book "${title}":`, error.message);
            }
        }

        console.log('\nSummary:');
        console.log(`- Old books deleted: ${deleteResult.deletedCount}`);
        console.log(`- New books added: ${addedCount}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

resetG42Books(); 