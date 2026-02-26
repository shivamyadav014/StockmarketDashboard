import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import styles from './AdminPanelPage.module.css';

const AdminPanelPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectReason, setRejectReason] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAllTransactions(
        statusFilter,
        null
      );
      setTransactions(response.data.transactions || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      await transactionAPI.approveTransaction(transactionId);
      setSuccess('Transaction approved!');
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve transaction');
    }
  };

  const handleReject = async (transactionId) => {
    const reason = rejectReason[transactionId];
    if (!reason) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await transactionAPI.rejectTransaction(transactionId, reason);
      setSuccess('Transaction rejected!');
      setRejectReason({});
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject transaction');
    }
  };

  return (
    <div className={styles.adminPanel}>
      <div className={styles.container}>
        <h1>Admin Panel</h1>
        <p className={styles.subtitle}>Manage transaction requests</p>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {/* Filter Section */}
        <div className={styles.filterSection}>
          <label>Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className={styles.loading}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className={styles.empty}>No transactions found</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Symbol</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trans) => (
                  <tr key={trans._id}>
                    <td>{trans.userId?.username || 'Unknown'}</td>
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
                        style={{
                          backgroundColor:
                            trans.status === 'pending'
                              ? '#f0ad4e'
                              : trans.status === 'approved'
                              ? '#5cb85c'
                              : '#ff6b6b',
                        }}
                      >
                        {trans.status}
                      </span>
                    </td>
                    <td>{new Date(trans.createdAt).toLocaleDateString()}</td>
                    <td className={styles.actions}>
                      {trans.status === 'pending' ? (
                        <div className={styles.actionGroup}>
                          <button
                            onClick={() => handleApprove(trans._id)}
                            className={`${styles.btn} ${styles.approve}`}
                          >
                            ✓ Approve
                          </button>
                          <div className={styles.rejectGroup}>
                            <input
                              type="text"
                              value={rejectReason[trans._id] || ''}
                              onChange={(e) =>
                                setRejectReason({
                                  ...rejectReason,
                                  [trans._id]: e.target.value,
                                })
                              }
                              placeholder="Reason..."
                              className={styles.reasonInput}
                            />
                            <button
                              onClick={() => handleReject(trans._id)}
                              className={`${styles.btn} ${styles.reject}`}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className={styles.noAction}>No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelPage;
