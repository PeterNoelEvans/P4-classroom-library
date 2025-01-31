const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('../models/book');

async function backupDatabase() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27018/SchoolLibrary');
        console.log('Connected to MongoDB');

        const books = await Book.find({});
        console.log(`Found ${books.length} books to backup`);

        // Create backups directory if it doesn't exist
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        // Save backup with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `books_backup_${timestamp}.json`);
        
        fs.writeFileSync(backupPath, JSON.stringify(books, null, 2));
        console.log(`Backup saved to: ${backupPath}`);

    } catch (error) {
        console.error('Error backing up database:', error);
    } finally {
        await mongoose.disconnect();
    }
}

backupDatabase(); 