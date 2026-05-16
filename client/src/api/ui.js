import apiClient from './client';

export const uiApi = {
  async search(query) {
    const response = await apiClient.get('/ui/search', { params: { q: query } });
    return response.data;
  },

  async getNotifications() {
    const response = await apiClient.get('/ui/notifications');
    return response.data;
  }
};
