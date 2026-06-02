const express = require('express');
const router = express.Router();
const { handlePlateScan } = require('../controllers/plateController');
const { requireVisionApiKey } = require('../middleware/apiKey');

router.post('/', requireVisionApiKey, handlePlateScan);

module.exports = router;
