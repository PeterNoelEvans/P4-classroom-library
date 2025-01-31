require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('../models/book');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function confirmAction(message) {
    return new Promise((resolve) => {
        rl.question(`${message} (yes/no): `, answer => {
            resolve(answer.toLowerCase() === 'yes');
        });
    });
}

async function importBooks() {
    try {
        // First, backup existing books
        console.log('Backing up existing books...');
        const existingBooks = await Book.find({});
        console.log(`Found ${existingBooks.length} existing books`);

        // Create backup before proceeding
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `books_backup_${timestamp}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(existingBooks, null, 2));
        console.log(`Backup saved to: ${backupPath}`);

        // Read book lists
        const g41Books = fs.readFileSync(path.join(__dirname, '../book-lists/G4-1-books.txt'), 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(title => ({
                title: title.trim(),
                assignedClass: '4/1'
            }));

        const g42Books = fs.readFileSync(path.join(__dirname, '../book-lists/G4-2-books.txt'), 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(title => ({
                title: title.trim(),
                assignedClass: '4/2'
            }));

        console.log(`Found ${g41Books.length} books for 4/1`);
        console.log(`Found ${g42Books.length} books for 4/2`);

        // Ask for confirmation before proceeding
        const shouldProceed = await confirmAction(
            'This will update class assignments for existing books and add new books. Proceed?'
        );

        if (!shouldProceed) {
            console.log('Operation cancelled');
            process.exit(0);
        }

        // Update existing books and add new ones
        for (const book of [...g41Books, ...g42Books]) {
            const existingBook = await Book.findOne({ title: book.title });
            if (existingBook) {
                // Update only the class assignment
                existingBook.assignedClass = book.assignedClass;
                await existingBook.save();
                console.log(`Updated class for: ${book.title}`);
            } else {
                // Add new book
                await Book.create({
                    ...book,
                    borrowCount: 0,
                    totalReads: 0,
                    borrowHistory: [],
                    quizQuestions: []
                });
                console.log(`Added new book: ${book.title}`);
            }
        }

        // Verify results
        const finalBooks = await Book.aggregate([
            {
                $group: {
                    _id: '$assignedClass',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('\nFinal book counts by class:');
        console.table(finalBooks);

    } catch (error) {
        console.error('Error importing books:', error);
    } finally {
        rl.close();
        await mongoose.disconnect();
    }
}

// Connect and run
mongoose.connect('mongodb://127.0.0.1:27018/SchoolLibrary')
    .then(() => {
        console.log('Connected to MongoDB');
        return importBooks();
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    }); 
    }); 