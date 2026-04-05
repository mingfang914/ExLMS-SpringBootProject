import api from './api';

const notificationService = {
    getNotifications: async () => {
        try {
            const response = await api.get('/v1/notifications');
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications", error);
            return [];
        }
    },

    markAsRead: async (id) => {
        return api.put(`/v1/notifications/${id}/read`);
    },

    markAllAsRead: async () => {
        return api.put('/v1/notifications/read-all');
    }
};

export default notificationService;
