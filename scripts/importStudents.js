require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/user');

async function importStudents() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27018/SchoolLibrary');
        console.log('Connected to MongoDB');

        // First, clear existing users to avoid duplicates
        await User.deleteMany({});
        console.log('Cleared existing users');

        const classes = ['G4-1', 'G4-2'];
        
        for (const className of classes) {
            const filePath = path.join(__dirname, '..', 'student-lists', `${className}-students.txt`);
            console.log(`\nProcessing ${className} from ${filePath}`);
            
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            for (const line of lines) {
                if (!line.trim()) continue;

                // Split on tabs first, then spaces
                let parts = line.includes('\t') ? 
                    line.split('\t').map(p => p.trim()) : 
                    line.split(/\s+/);

                // Get the exact nickname as it appears in the file
                const nickname = parts[parts.length - 1];
                parts.pop();
                const fullName = parts.join(' ').trim();

                const classNumber = className.replace('G', '').replace('-', '/');

                console.log(`Processing: "${line}"`);
                console.log(`-> Full Name: "${fullName}"`);
                console.log(`-> Nickname: "${nickname}"`);
                console.log(`-> Class: "${classNumber}"`);

                try {
                    // Create user with exact nickname as password
                    const user = new User({
                        fullName,
                        nickname,
                        class: classNumber,
                        password: nickname  // Exact case from file
                    });

                    await user.save();
                    console.log(`✓ Registered: ${fullName} (${nickname}) - Class ${classNumber}`);
                } catch (error) {
                    console.error(`✗ Error saving student: ${error.message}`);
                }
            }
        }

        // Verify the imports
        const students = await User.find({}).sort({ class: 1, fullName: 1 });
        console.log('\nImported Students:');
        students.forEach(s => {
            console.log(`${s.fullName} (${s.nickname}) - ${s.class}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run the import
importStudents(); 