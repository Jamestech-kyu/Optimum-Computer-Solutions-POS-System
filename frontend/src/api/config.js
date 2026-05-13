import api from './axiosInstance';

export const getTaxConfig = () =>
  api.get('/tax-config/');

export const getDiscounts = () =>
  api.get('/discounts/');