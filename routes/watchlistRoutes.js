const express = require('express');
const { addToWatchlist, removeFromWatchlist, getWatchlist } = require('../controllers/watchlistController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.post('/add', authMiddleware, addToWatchlist);
router.post('/remove', authMiddleware, removeFromWatchlist);
router.get('/', authMiddleware, getWatchlist);

module.exports = router;
