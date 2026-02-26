import React, { useState, useEffect } from 'react';
import { watchlistAPI, stockAPI } from '../services/api';
import styles from './WatchlistPage.module.css';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [stockDetails, setStockDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await watchlistAPI.getWatchlist();
      const watchlistItems = response.data.watchlist || [];
      setWatchlist(watchlistItems);

      // Fetch stock details for each item
      const details = {};
      for (const item of watchlistItems) {
        try {
          const stockRes = await stockAPI.searchStock(item.symbol);
          details[item.symbol] = stockRes.data.data;
        } catch (err) {
          details[item.symbol] = null;
        }
      }
      setStockDetails(details);
      setError('');
    } catch (err) {
      setError('Failed to fetch watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (symbol) => {
    try {
      await watchlistAPI.removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter((item) => item.symbol !== symbol));
      alert('Removed from watchlist');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove stock');
    }
  };

  return (
    <div className={styles.watchlist}>
      <div className={styles.container}>
        <h1>My Watchlist</h1>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Loading watchlist...</div>
        ) : watchlist.length === 0 ? (
          <div className={styles.empty}>
            <p>No stocks in your watchlist yet</p>
            <a href="/dashboard">Go to Dashboard to add stocks</a>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {watchlist.map((item) => {
              const details = stockDetails[item.symbol];
              return (
                <div key={item.symbol} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>{item.symbol}</h3>
                    <button
                      onClick={() => handleRemove(item.symbol)}
                      className={styles.removeBtn}
                    >
                      ✕
                    </button>
                  </div>

                  {details ? (
                    <div className={styles.cardBody}>
                      <div className={styles.priceRow}>
                        <span>Price:</span>
                        <strong>${details.price}</strong>
                      </div>
                      <div className={styles.priceRow}>
                        <span>Change:</span>
                        <strong
                          className={
                            parseFloat(details.change) >= 0
                              ? styles.positive
                              : styles.negative
                          }
                        >
                          {parseFloat(details.change) >= 0 ? '+' : ''}
                          {details.change} ({details.changePercent})
                        </strong>
                      </div>
                      <div className={styles.priceRow}>
                        <span>High:</span>
                        <strong>${details.high}</strong>
                      </div>
                      <div className={styles.priceRow}>
                        <span>Low:</span>
                        <strong>${details.low}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.cardBody}>
                      <p className={styles.noData}>Unable to fetch data</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
