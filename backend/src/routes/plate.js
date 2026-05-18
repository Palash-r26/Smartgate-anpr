const express = require('express');
const router = express.Router();
const { handlePlateScan } = require('../controllers/plateController');

router.post('/', handlePlateScan);

module.exports = router;
