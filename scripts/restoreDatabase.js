const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('../models/book');

async function restoreDatabase(backupFile) {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27018/SchoolLibrary');
        console.log('Connected to MongoDB');

        const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
        console.log(`Found ${backupData.length} books in backup`);

        // Clear current books
        await Book.deleteMany({});

        // Restore from backup
        await Book.insertMany(backupData);
        console.log('Restore complete!');

    } catch (error) {
        console.error('Error restoring database:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Get the most recent backup file
const backupDir = path.join(__dirname, '../backups');
const backupFiles = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('books_backup_'))
    .sort()
    .reverse();

if (backupFiles.length > 0) {
    const latestBackup = path.join(backupDir, backupFiles[0]);
    console.log(`Restoring from: ${latestBackup}`);
    restoreDatabase(latestBackup);
} else {
    console.log('No backup files found!');
} 