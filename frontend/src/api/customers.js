import axiosInstance from './axiosInstance';

export const getCustomers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customers/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomer = async (id) => {
  try {
    const response = await axiosInstance.get(`/customers/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCustomer = async (data) => {
  try {
    const response = await axiosInstance.post('/customers/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCustomer = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/customers/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await axiosInstance.delete(`/customers/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchCustomers = async (query = '', filters = {}) => {
  try {
    const params = {
      q: query,
      ...filters,
    };
    const response = await axiosInstance.get('/customers/search/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addLoyaltyPoints = async (id, points) => {
  try {
    const response = await axiosInstance.post(
      `/customers/${id}/add_loyalty_points/`,
      { points }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCredit = async (id, creditData) => {
  try {
    const response = await axiosInstance.post(
      `/customers/${id}/update_credit/`,
      creditData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerPurchaseHistory = async (id) => {
  try {
    const response = await axiosInstance.get(`/customers/${id}/purchase_history/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
