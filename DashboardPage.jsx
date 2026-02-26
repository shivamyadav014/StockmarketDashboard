import React, { useState, useEffect } from 'react';
import { stockAPI, watchlistAPI } from '../services/api';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  // Fetch watchlist on mount
  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await watchlistAPI.getWatchlist();
      setWatchlist(response.data.watchlist || []);
      setWatchlistLoading(false);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
      setWatchlistLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError('');
    setStockData(null);

    try {
      const response = await stockAPI.searchStock(searchTerm);
      setStockData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      await watchlistAPI.addToWatchlist(stockData.symbol, stockData.symbol);
      setWatchlist([
        ...watchlist,
        { symbol: stockData.symbol, name: stockData.symbol },
      ]);
      alert('Added to watchlist!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add to watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await watchlistAPI.removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter((item) => item.symbol !== symbol));
      alert('Removed from watchlist!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove from watchlist');
    }
  };

  const isInWatchlist = stockData?.symbol && watchlist.some(
    (item) => item.symbol === stockData.symbol
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <h1>Stock Dashboard</h1>

        {/* Search Section */}
        <div className={styles.searchSection}>
          <form onSubmit={handleSearch}>
            <div className={styles.searchBox}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
                className={styles.input}
              />
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.content}>
          {/* Stock Data Section */}
          <div className={styles.stockSection}>
            {stockData && (
              <div className={styles.stockCard}>
                <div className={styles.header}>
                  <h2>{stockData.symbol}</h2>
                  <button
                    onClick={() =>
                      isInWatchlist
                        ? handleRemoveFromWatchlist(stockData.symbol)
                        : handleAddToWatchlist()
                    }
                    className={`${styles.watchlistBtn} ${
                      isInWatchlist ? styles.inWatchlist : ''
                    }`}
                  >
                    {isInWatchlist ? '⭐ In Watchlist' : '☆ Add to Watchlist'}
                  </button>
                </div>

                <div className={styles.priceInfo}>
                  <div className={styles.priceItem}>
                    <span className={styles.label}>Current Price:</span>
                    <span className={styles.value}>${stockData.price}</span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.label}>Change:</span>
                    <span className={`${styles.value} ${
                      parseFloat(stockData.change) >= 0 ? styles.positive : styles.negative
                    }`}>
                      {parseFloat(stockData.change) >= 0 ? '+' : ''}{stockData.change} ({stockData.changePercent})
                    </span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.label}>High:</span>
                    <span className={styles.value}>${stockData.high}</span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.label}>Low:</span>
                    <span className={styles.value}>${stockData.low}</span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.label}>Previous Close:</span>
                    <span className={styles.value}>${stockData.previousClose}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Watchlist Section */}
          <div className={styles.watchlistSection}>
            <h2>Your Watchlist</h2>
            {watchlistLoading ? (
              <p>Loading watchlist...</p>
            ) : watchlist.length === 0 ? (
              <p className={styles.empty}>No stocks in your watchlist</p>
            ) : (
              <ul className={styles.watchlistList}>
                {watchlist.map((item) => (
                  <li key={item.symbol} className={styles.watchlistItem}>
                    <span>{item.symbol}</span>
                    <button
                      onClick={() => handleRemoveFromWatchlist(item.symbol)}
                      className={styles.removeBtn}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
