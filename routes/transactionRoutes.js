const express = require('express');
const {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  approveTransaction,
  rejectTransaction,
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// User routes
router.post('/', authMiddleware, createTransaction);
router.get('/user/:userId', authMiddleware, getUserTransactions);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllTransactions);
router.put('/:transactionId/approve', authMiddleware, adminMiddleware, approveTransaction);
router.put('/:transactionId/reject', authMiddleware, adminMiddleware, rejectTransaction);

module.exports = router;
