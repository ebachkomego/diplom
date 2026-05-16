import apiClient from './client';

export const productsApi = {
  getAll: async (params) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};

export const customersApi = {
  getAll: async (params) => {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  }
};
