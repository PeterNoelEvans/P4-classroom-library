require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27018/SchoolLibrary');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('\nAll users in database:');
        users.forEach(user => {
            console.log({
                fullName: user.fullName,
                nickname: user.nickname,
                class: user.class,
                passwordLength: user.password?.length
            });
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers(); 