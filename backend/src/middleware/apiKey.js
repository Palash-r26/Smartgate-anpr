const requireVisionApiKey = (req, res, next) => {
    const expected = process.env.VISION_API_KEY;
    if (!expected) {
        return next();
    }

    const provided = req.headers['x-api-key'];
    if (provided !== expected) {
        return res.status(401).json({ error: 'Invalid vision API key' });
    }

    return next();
};

module.exports = { requireVisionApiKey };
