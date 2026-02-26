require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Requests for frontend
app.use(express.json({ limit: '50mb' })); // Parse JSON request bodies with 50MB limit for profile pictures

// Connect to MongoDB
connectDB().then(async () => {
  // optional automated admin promotion
  if (process.env.ADMIN_EMAIL) {
    const User = require('./models/User');
    try {
      const res = await User.findOneAndUpdate(
        { email: process.env.ADMIN_EMAIL.toLowerCase() },
        { role: 'admin' },
        { new: true }
      );
      if (res) {
        console.log('Auto-promoted admin user:', res.email);
      } else {
        console.log('ADMIN_EMAIL set but user not found:', process.env.ADMIN_EMAIL);
      }
    } catch (err) {
      console.error('Error promoting admin on startup:', err.message);
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: '✓ Backend is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Error handling for 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
