import api from './axiosInstance';

export const login = (credentials) =>
  api.post('/auth/login/', credentials);

export const refreshToken = (refresh) =>
  api.post('/auth/refresh/', { refresh });

export const logout = () =>
  api.post('/auth/logout/');