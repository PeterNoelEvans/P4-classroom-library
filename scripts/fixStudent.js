require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

async function fixStudent() {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27018/SchoolLibrary');
        console.log('Connected to MongoDB');

        // First find the user
        const user = await User.findOne({ fullName: 'Pulawat Sutipanwihan Poon' });
        
        if (user) {
            // Update user properties
            user.fullName = 'Pulawat Sutipanwihan';
            user.nickname = 'Poonpoon';
            user.password = 'Poonpoon';  // This will be hashed by the pre-save middleware

            // Save the user (this will trigger the password hashing)
            const result = await user.save();

            console.log('Updated student record:');
            console.log('- Old name:', 'Pulawat Sutipanwihan Poon');
            console.log('- New name:', result.fullName);
            console.log('- New nickname:', result.nickname);
            console.log('- Class:', result.class);
            console.log('Password has been reset to match the new nickname');
        } else {
            console.log('Student not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixStudent(); 