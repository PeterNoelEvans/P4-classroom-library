const mongoose = require('mongoose');
const Book = require('../models/book');

async function fixBookClasses() {
    try {
        // Find all books with no class or 'N/A' class
        const booksToFix = await Book.find({
            $or: [
                { assignedClass: null },
                { assignedClass: 'N/A' },
                { assignedClass: { $exists: false } }
            ]
        });

        console.log(`Found ${booksToFix.length} books to fix`);

        // Update each book to assign to 4/1 by default
        // You might want to modify this logic based on your needs
        for (const book of booksToFix) {
            book.assignedClass = '4/1';  // Default to 4/1
            await book.save();
            console.log(`Updated book: ${book.title}`);
        }

        console.log('Finished fixing book classes');
    } catch (error) {
        console.error('Error fixing book classes:', error);
    }
}

// Run the fix if this script is executed directly
if (require.main === module) {
    mongoose.connect('mongodb://localhost:27018/SchoolLibrary')
        .then(() => {
            console.log('Connected to MongoDB');
            return fixBookClasses();
        })
        .then(() => {
            console.log('Done');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
} 