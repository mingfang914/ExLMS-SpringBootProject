import axios from './api';

const collabService = {
  getGroupCollabs: async (groupId) => {
    const response = await axios.get(`/v1/groups/${groupId}/collabs`);
    return response.data;
  },

  getCollabById: async (id) => {
    const response = await axios.get(`/v1/collabs/${id}`);
    return response.data;
  },

  createCollab: async (groupId, data) => {
    const response = await axios.post(`/v1/groups/${groupId}/collabs`, data);
    return response.data;
  },

  updateCollab: async (id, data) => {
    const response = await axios.put(`/v1/collabs/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axios.put(`/v1/collabs/${id}/status`, { status });
    return response.data;
  },

  deleteCollab: async (id) => {
    await axios.delete(`/v1/collabs/${id}`);
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // key
  },

  getImageUrl: async (key) => {
    const response = await axios.get(`/api/files/download-url/${key}`);
    return response.data;
  }
};

export default collabService;
