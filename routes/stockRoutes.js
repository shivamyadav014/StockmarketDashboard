const express = require('express');
const { searchStock, getHistoricalData } = require('../controllers/stockController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Both routes require authentication
router.get('/search', authMiddleware, searchStock);
router.get('/historical', authMiddleware, getHistoricalData);

module.exports = router;
