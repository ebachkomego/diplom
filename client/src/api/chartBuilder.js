import apiClient from './client';

export const chartBuilderApi = {
  async getDatasets() {
    const response = await apiClient.get('/reports/chart-builder/datasets');
    return response.data;
  },

  async query(config) {
    const response = await apiClient.post('/reports/chart-builder/query', config);
    return response.data;
  },

  async getTemplates() {
    const response = await apiClient.get('/reports/chart-builder/templates');
    return response.data;
  },

  async createTemplate(payload) {
    const response = await apiClient.post('/reports/chart-builder/templates', payload);
    return response.data;
  },
  
  async initializeStorage() {
    const response = await apiClient.post('/reports/chart-builder/init');
    return response.data;
  }
};
