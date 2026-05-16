import apiClient from './client';

export const ordersApi = {
  getAll: async (params) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/orders/${id}`, data);
    return response.data;
  },

  changeStatus: async (id, status) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  }
};
