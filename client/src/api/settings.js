import apiClient from './client';

export const settingsApi = {
  getNotificationEmail: async () => {
    const response = await apiClient.get('/settings/notification-email');
    return response.data;
  },
  updateNotificationEmail: async (email) => {
    const response = await apiClient.put('/settings/notification-email', { email });
    return response.data;
  },
  getSmtpSettings: async () => {
    const response = await apiClient.get('/settings/smtp');
    return response.data;
  },
  updateSmtpSettings: async (smtp_user, smtp_pass) => {
    const response = await apiClient.put('/settings/smtp', { smtp_user, smtp_pass });
    return response.data;
  }
};
