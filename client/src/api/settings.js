import apiClient from './client';

export const settingsApi = {
  getNotificationEmail: async () => {
    const response = await apiClient.get('/settings/notification-email');
    return response.data;
  },
  updateNotificationEmail: async (email) => {
    const response = await apiClient.put('/settings/notification-email', { email });
    return response.data;
  }
};
