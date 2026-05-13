import api from './axiosInstance';

export const getReturns = (params = {}) =>
  api.get('/returns/', { params });

export const createReturn = (data) =>
  api.post('/returns/', data);

export const getReturn = (id) =>
  api.get(`/returns/${id}/`);