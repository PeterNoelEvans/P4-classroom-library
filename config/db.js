const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27018/SchoolLibrary', {
            // Remove deprecated options
        });
        console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Don't exit the process, just log the error
        // process.exit(1);
    }
};

module.exports = connectDB; 