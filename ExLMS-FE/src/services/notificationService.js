import api from './api';

const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/v1/notifications');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/v1/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/v1/notifications/read-all');
    return response.data;
  }
};

export default notificationService;
