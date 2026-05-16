import apiClient from './client';

export const productionApi = {
  // Получение заданий
  getTasks: async (params) => {
    const response = await apiClient.get('/production/tasks', { params });
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },
  
  // Получение данных для Диаграммы Ганта
  getGanttData: async () => {
    const response = await apiClient.get('/production/gantt');
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  // Создание нового задания из заказа
  createTask: async (data) => {
    const response = await apiClient.post('/production/tasks', data);
    return response.data;
  },

  // Обновление статуса задания (например, мастер берет в работу)
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/production/tasks/${id}/status`, { status });
    return response.data;
  }
};
