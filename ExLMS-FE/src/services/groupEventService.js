import axios from 'axios';

const API_URL = 'http://localhost:8080/api/groups';

class GroupEventService {
  getGroupEvents(groupId) {
    return axios.get(`${API_URL}/${groupId}/events`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  createGroupEvent(groupId, eventData) {
    return axios.post(`${API_URL}/${groupId}/events`, eventData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  updateGroupEvent(groupId, eventId, eventData) {
    return axios.put(`${API_URL}/${groupId}/events/${eventId}`, eventData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  deleteGroupEvent(groupId, eventId) {
    return axios.delete(`${API_URL}/${groupId}/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
}

export default new GroupEventService();
