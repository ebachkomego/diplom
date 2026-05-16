import apiClient from './client';

export const warehouseApi = {
  // Получение общих остатков (и материалы, и продукция)
  getAll: async () => {
    const response = await apiClient.get('/warehouse');
    return response.data;
  },

  // Отдельно материалы
  getMaterials: async () => {
    const response = await apiClient.get('/warehouse/materials');
    return response.data;
  },

  // Отдельно готовая продукция
  getProducts: async () => {
    const response = await apiClient.get('/warehouse/products');
    return response.data;
  },

  // Приход на склад
  receive: async (data) => {
    // В data должно быть: item_type ('material' или 'product'), item_id, quantity, location
    const response = await apiClient.post('/warehouse/receive', data);
    return response.data;
  },

  // Списание/выдача со склада
  issue: async (data) => {
    const response = await apiClient.post('/warehouse/issue', data);
    return response.data;
  }
};
