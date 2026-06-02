const express = require('express');
const router = express.Router();
const { register, login, syncGoogleUser, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google-sync', syncGoogleUser);
router.get('/me', requireAuth(), me);

module.exports = router;
