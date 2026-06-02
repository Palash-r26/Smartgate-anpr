const express = require('express');
const router = express.Router();
const { getStats, getLogs, getVehicles, addVehicle } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.get('/stats', requireAuth(['ADMIN', 'SECURITY']), getStats);
router.get('/logs', requireAuth(['ADMIN', 'SECURITY']), getLogs);
router.get('/vehicles', requireAuth(['ADMIN', 'SECURITY']), getVehicles);
router.post('/vehicles', requireAuth(['ADMIN']), addVehicle);

module.exports = router;
