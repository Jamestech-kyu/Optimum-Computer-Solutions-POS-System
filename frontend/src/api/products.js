import api from './axiosInstance';

export const getProducts = (search = '') =>
  api.get('/products/', { params: { search } });

export const getProduct = (id) =>
  api.get(`/products/${id}/`);

export const getCategories = () =>
  api.get('/categories/');

export const createProduct = (data) =>
  api.post('/products/', data);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}/`, data);