const Transaction = require('../models/Transaction');
const User = require('../models/User');

/*
CREATE BUY/SELL REQUEST
- User submits buy or sell request
- Creates transaction with 'pending' status
- Awaits admin approval
*/
const createTransaction = async (req, res) => {
  try {
    const { stockSymbol, stockName, transactionType, quantity, price } = req.body;

    // Validation
    if (!stockSymbol || !stockName || !transactionType || !quantity || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['buy', 'sell'].includes(transactionType)) {
      return res.status(400).json({ error: 'Transaction type must be buy or sell' });
    }

    if (quantity <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Quantity and price must be positive' });
    }

    // Create transaction
    const transaction = new Transaction({
      userId: req.userId,
      stockSymbol: stockSymbol.toUpperCase(),
      stockName,
      transactionType,
      quantity,
      price,
    });

    await transaction.save();

    res.status(201).json({
      message: 'Transaction request submitted for approval',
      transaction,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

/*
GET USER TRANSACTIONS
- Fetch all transactions for current user
- Shows pending, approved, and rejected transactions
*/
const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

/*
GET ALL TRANSACTIONS (ADMIN ONLY)
- Admin can view all transactions from all users
- Filter by status or user
*/
const getAllTransactions = async (req, res) => {
  try {
    const { status, userId } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const transactions = await Transaction.find(filter)
      .populate('userId', 'username email')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

/*
APPROVE TRANSACTION (ADMIN ONLY)
- Admin approves a pending transaction
- Updates status to 'approved'
- Records which admin approved it
*/
const approveTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending transactions can be approved' });
    }

    transaction.status = 'approved';
    transaction.approvedBy = req.userId;

    await transaction.save();

    res.status(200).json({
      message: 'Transaction approved successfully',
      transaction,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve transaction' });
  }
};

/*
REJECT TRANSACTION (ADMIN ONLY)
- Admin rejects a pending transaction
- Updates status to 'rejected'
- Records rejection reason
*/
const rejectTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending transactions can be rejected' });
    }

    transaction.status = 'rejected';
    transaction.rejectionReason = reason;
    transaction.approvedBy = req.userId;

    await transaction.save();

    res.status(200).json({
      message: 'Transaction rejected successfully',
      transaction,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject transaction' });
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  approveTransaction,
  rejectTransaction,
};
