const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

const signToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanName = (name || '').trim();

        if (!cleanEmail || !password || password.length < 6) {
            return res.status(400).json({ error: 'Email and password (min 6 chars) required' });
        }

        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [cleanEmail]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userRole = role === 'ADMIN' ? 'ADMIN' : 'SECURITY';

        const [result] = await pool.execute(
            'INSERT INTO users (email, password_hash, name, role, provider) VALUES (?, ?, ?, ?, ?)',
            [cleanEmail, passwordHash, cleanName || cleanEmail.split('@')[0], userRole, 'local']
        );

        const user = {
            id: result.insertId,
            email: cleanEmail,
            name: cleanName || cleanEmail.split('@')[0],
            role: userRole,
        };

        return res.status(201).json({
            success: true,
            token: signToken(user),
            user,
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = (email || '').trim().toLowerCase();

        const [rows] = await pool.execute(
            'SELECT id, email, password_hash, name, role FROM users WHERE email = ? AND is_active = 1',
            [cleanEmail]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        if (!user.password_hash) {
            return res.status(401).json({ error: 'Use Google sign-in for this account' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const safeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        return res.json({ success: true, token: signToken(safeUser), user: safeUser });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
};

const syncGoogleUser = async (req, res) => {
    try {
        const { email, name, googleId } = req.body;
        const cleanEmail = (email || '').trim().toLowerCase();

        if (!cleanEmail || !googleId) {
            return res.status(400).json({ error: 'Email and googleId required' });
        }

        const [existing] = await pool.execute(
            'SELECT id, email, name, role FROM users WHERE email = ? OR google_id = ?',
            [cleanEmail, googleId]
        );

        if (existing.length > 0) {
            const user = existing[0];
            await pool.execute(
                'UPDATE users SET google_id = ?, name = ?, provider = ? WHERE id = ?',
                [googleId, name || user.name, 'google', user.id]
            );
            return res.json({
                success: true,
                token: signToken(user),
                user,
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO users (email, name, role, google_id, provider) VALUES (?, ?, ?, ?, ?)',
            [cleanEmail, name || cleanEmail.split('@')[0], 'SECURITY', googleId, 'google']
        );

        const user = {
            id: result.insertId,
            email: cleanEmail,
            name: name || cleanEmail.split('@')[0],
            role: 'SECURITY',
        };

        return res.status(201).json({ success: true, token: signToken(user), user });
    } catch (error) {
        console.error('Google sync error:', error);
        return res.status(500).json({ error: 'Google sync failed' });
    }
};

const me = async (req, res) => {
    return res.json({ user: req.user });
};

module.exports = { register, login, syncGoogleUser, me };
