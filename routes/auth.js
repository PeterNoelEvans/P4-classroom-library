const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // In production, use environment variable

// Register a new user (protected by admin password)
router.post('/register', async (req, res) => {
    try {
        const { fullName, nickname, class: studentClass, adminPassword } = req.body;

        // Verify admin password
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid admin password' });
        }

        // Check if user exists
        const userExists = await User.findOne({ fullName });
        if (userExists) {
            return res.status(400).json({ message: 'Student already registered' });
        }

        // Create user with nickname as password
        const user = new User({
            fullName,
            nickname,
            class: studentClass,
            password: nickname  // This will be hashed by the pre-save middleware
        });

        await user.save();
        res.status(201).json({ 
            message: 'Student registered successfully',
            nickname: user.nickname  // Send back nickname for confirmation
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { fullName, class: studentClass, password } = req.body;
        
        // Debug logging with character codes
        console.log('Login attempt details:');
        console.log('Full Name:', {
            value: fullName,
            length: fullName.length,
            chars: [...fullName].map(c => ({ char: c, code: c.charCodeAt(0) }))
        });

        // Find user with more flexible name matching
        const users = await User.find({ class: studentClass });
        
        // Find closest matching name
        const user = users.find(u => {
            // Remove extra spaces and make case insensitive
            const cleanInput = fullName.replace(/\s+/g, ' ').trim().toLowerCase();
            const cleanStored = u.fullName.replace(/\s+/g, ' ').trim().toLowerCase();
            return cleanInput === cleanStored;
        });
        
        if (!user) {
            // Log all available names in that class for debugging
            console.log('Available names in class', studentClass, ':');
            users.forEach(u => console.log('- ' + u.fullName));
            console.log('User not found:', fullName);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Found user:', {
            fullName: user.fullName,
            nickname: user.nickname,
            nicknameChars: [...user.nickname].map(c => ({ char: c, code: c.charCodeAt(0) }))
        });

        // Compare passwords exactly as entered
        const isMatch = await user.matchPassword(password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, class: user.class },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            class: user.class,
            nickname: user.nickname
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Reset password to nickname (teacher only)
router.post('/reset-password', async (req, res) => {
    try {
        const { fullName, class: studentClass, adminPassword } = req.body;

        // Verify admin password
        if (adminPassword !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid admin password' });
        }

        // Find user
        const user = await User.findOne({ fullName, class: studentClass });
        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Reset password to nickname
        user.password = user.nickname;
        await user.save();

        res.json({ message: 'Password reset to nickname successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = router; 