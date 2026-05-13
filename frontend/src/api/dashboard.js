import api from './axiosInstance';

export const getDashboardStatistics = () =>
  api.get('/dashboard/statistics/');
