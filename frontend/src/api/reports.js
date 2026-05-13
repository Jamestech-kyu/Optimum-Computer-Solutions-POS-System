import api from './axiosInstance';

export const getDailySummary = (date) =>
  api.get('/reports/daily-summary/', { params: { date } });

export const getTransactionHistory = (params = {}) =>
  api.get('/reports/transaction-history/', { params });

export const getTopProducts = (params = {}) =>
  api.get('/reports/top-products/', { params });