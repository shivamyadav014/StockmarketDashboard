import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI, stockAPI } from '../services/api';
import styles from './UserPanelPage.module.css';

const UserPanelPage = () => {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [transactionType, setTransactionType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transLoading, setTransLoading] = useState(true);

  // Fetch user transactions on mount
  useEffect(() => {
    fetchUserTransactions();
  }, []);

  const fetchUserTransactions = async () => {
    try {
      if (user?.id) {
        const response = await transactionAPI.getUserTransactions(user.id);
        setTransactions(response.data.transactions || []);
      }
      setTransLoading(false);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransLoading(false);
    }
  };

  const handleFetchPrice = async () => {
    if (!symbol) {
      setError('Please enter a stock symbol');
      return;
    }

    try {
      setError('');
      const response = await stockAPI.searchStock(symbol);
      const data = response.data.data;
      setName(data.symbol);
      setPrice(data.price);
    } catch (err) {
      setError('Stock not found');
      setPrice('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!symbol || !name || !quantity || !price) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      if (quantity <= 0 || price <= 0) {
        setError('Quantity and price must be positive');
        setLoading(false);
        return;
      }

      // Submit transaction
      await transactionAPI.createTransaction(
        symbol.toUpperCase(),
        name,
        transactionType,
        parseInt(quantity),
        parseFloat(price)
      );

      setSuccess(
        `${transactionType.toUpperCase()} request submitted! Awaiting admin approval.`
      );

      // Clear form
      setSymbol('');
      setName('');
      setQuantity('');
      setPrice('');

      // Refresh transactions
      fetchUserTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f0ad4e';
      case 'approved':
        return '#5cb85c';
      case 'rejected':
        return '#ff6b6b';
      default:
        return '#999';
    }
  };

  return (
    <div className={styles.userPanel}>
      <div className={styles.container}>
        <h1>Trading Panel</h1>
        <p className={styles.subtitle}>Submit buy/sell requests (Admin approval required)</p>

        <div className={styles.content}>
          {/* Form Section */}
          <div className={styles.formSection}>
            <h2>Submit Transaction</h2>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Transaction Type:</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className={styles.select}
                >
                  <option value="buy">BUY</option>
                  <option value="sell">SELL</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Stock Symbol:</label>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g., AAPL"
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={handleFetchPrice}
                    className={styles.fetchBtn}
                  >
                    Fetch Price
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Stock Name:</label>
                <input
                  type="text"
                  value={name}
                  placeholder="Stock name"
                  className={styles.input}
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label>Quantity:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Number of shares"
                  className={styles.input}
                  min="1"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Price per Share:</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price per share"
                  className={styles.input}
                  step="0.01"
                  min="0"
                />
              </div>

              {quantity && price && (
                <div className={styles.totalAmount}>
                  Total Amount: <strong>${(quantity * price).toFixed(2)}</strong>
                </div>
              )}

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>

          {/* Transaction History Section */}
          <div className={styles.historySection}>
            <h2>Transaction History</h2>

            {transLoading ? (
              <p>Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className={styles.empty}>No transactions yet</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Symbol</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((trans) => (
                      <tr key={trans._id}>
                        <td>
                          <span className={`${styles.type} ${styles[trans.transactionType]}`}>
                            {trans.transactionType.toUpperCase()}
                          </span>
                        </td>
                        <td>{trans.stockSymbol}</td>
                        <td>{trans.quantity}</td>
                        <td>${trans.price.toFixed(2)}</td>
                        <td>${trans.totalAmount.toFixed(2)}</td>
                        <td>
                          <span
                            className={styles.status}
                            style={{ backgroundColor: getStatusColor(trans.status) }}
                          >
                            {trans.status}
                          </span>
                        </td>
                        <td>{new Date(trans.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPanelPage;
