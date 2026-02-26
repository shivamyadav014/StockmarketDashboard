import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  signup: (username, email, password) =>
    api.post('/auth/signup', { username, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getProfile: () =>
    api.get('/auth/profile'),
  updateProfile: (profileData) =>
    api.put('/auth/profile', profileData),
};

// Stock endpoints
export const stockAPI = {
  searchStock: (symbol) =>
    api.get('/stock/search', { params: { symbol } }),
  getHistoricalData: (symbol, days = 30) =>
    api.get('/stock/historical', { params: { symbol, days } }),
};

// Transaction endpoints
export const transactionAPI = {
  createTransaction: (stockSymbol, stockName, transactionType, quantity, price) =>
    api.post('/transactions', {
      stockSymbol,
      stockName,
      transactionType,
      quantity,
      price,
    }),
  getUserTransactions: (userId) =>
    api.get(`/transactions/user/${userId}`),
  getAllTransactions: (status, userId) =>
    api.get('/transactions', { params: { status, userId } }),
  approveTransaction: (transactionId) =>
    api.put(`/transactions/${transactionId}/approve`),
  rejectTransaction: (transactionId, reason) =>
    api.put(`/transactions/${transactionId}/reject`, { reason }),
};

// Watchlist endpoints
export const watchlistAPI = {
  addToWatchlist: (symbol, name) =>
    api.post('/watchlist/add', { symbol, name }),
  removeFromWatchlist: (symbol) =>
    api.post('/watchlist/remove', { symbol }),
  getWatchlist: () =>
    api.get('/watchlist'),
};

export default api;
