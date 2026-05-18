const express = require('express');
const router = express.Router();
const { getStats, getLogs, getVehicles, addVehicle } = require('../controllers/dashboardController');

router.get('/stats', getStats);
router.get('/logs', getLogs);
router.get('/vehicles', getVehicles);
router.post('/vehicles', addVehicle);

module.exports = router;
