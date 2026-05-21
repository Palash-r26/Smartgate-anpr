const jwt = require('jsonwebtoken');

const requireAuth = (roles = []) => {
    return (req, res, next) => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ error: 'JWT_SECRET not configured' });
        }

        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        try {
            const payload = jwt.verify(token, secret);
            req.user = payload;

            if (roles.length > 0 && !roles.includes(payload.role)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            return next();
        } catch {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    };
};

module.exports = { requireAuth };
