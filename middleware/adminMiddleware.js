const jwt = require('jsonwebtoken');

const adminProtect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        req.isAdmin = true;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(401).json({ message: 'Invalid admin token' });
    }
};

module.exports = { adminProtect }; 