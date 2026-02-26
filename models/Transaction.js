const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stockSymbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      uppercase: true,
    },
    stockName: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Automatically calculate totalAmount before validation (so it passes required check)
transactionSchema.pre('validate', function (next) {
  if (this.quantity != null && this.price != null) {
    this.totalAmount = this.quantity * this.price;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
