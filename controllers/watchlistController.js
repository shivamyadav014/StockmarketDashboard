const User = require('../models/User');

/*
ADD TO WATCHLIST
- User can add a stock to their watchlist
- Prevents duplicate entries
*/
const addToWatchlist = async (req, res) => {
  try {
    const { symbol, name } = req.body;

    if (!symbol || !name) {
      return res.status(400).json({ error: 'Symbol and name are required' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already in watchlist
    const alreadyExists = user.watchlist.some(
      (item) => item.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (alreadyExists) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }

    // Add to watchlist
    user.watchlist.push({
      symbol: symbol.toUpperCase(),
      name,
    });

    await user.save();

    res.status(200).json({
      message: 'Stock added to watchlist',
      watchlist: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
};

/*
REMOVE FROM WATCHLIST
- User can remove a stock from their watchlist
*/
const removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from watchlist
    user.watchlist = user.watchlist.filter(
      (item) => item.symbol.toUpperCase() !== symbol.toUpperCase()
    );

    await user.save();

    res.status(200).json({
      message: 'Stock removed from watchlist',
      watchlist: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
};

/*
GET WATCHLIST
- Fetch all stocks in user's watchlist
*/
const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      count: user.watchlist.length,
      watchlist: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
};

module.exports = { addToWatchlist, removeFromWatchlist, getWatchlist };
