const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token introuvable ou format invalide' });
        }

        const token = authHeader.split(' ')[1];

        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);

        req.user = { userId: decoded.userId, email: decoded.email };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalide ou expiré', error: error.message });
    }
};

module.exports = authMiddleware;
