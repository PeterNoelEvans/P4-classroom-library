const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';  // Use environment variable in production

const protect = async (req, res, next) => {
    try {
        console.log('Auth Headers:', req.headers); // Log all headers

        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token found:', token);
        }

        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('Decoded token:', decoded);

            const user = await User.findById(decoded.userId);
            console.log('Found user:', user);

            if (!user) {
                console.log('No user found with token ID');
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Auth middleware error' });
    }
};

// Middleware to check if user is from specific class
const checkClass = (allowedClass) => (req, res, next) => {
    if (req.user && req.user.class === allowedClass) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized for this class' });
    }
};

module.exports = { protect, checkClass }; 