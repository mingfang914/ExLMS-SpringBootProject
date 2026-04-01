import api from './api'

const assignmentService = {
  createAssignment: (groupId, data) => api.post(`/v1/groups/${groupId}/assignments`, data),
  getAssignmentsByGroup: (groupId) => api.get(`/v1/groups/${groupId}/assignments`),
  getAssignmentById: (id) => api.get(`/v1/assignments/${id}`),
  updateAssignment: (id, data) => api.put(`/v1/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/v1/assignments/${id}`),

  // ── Inventory & Deployment ──────────────────────────────────────────────────
  getInventory: async () => {
    const response = await api.get('/v1/inventory/assignments')
    return response.data
  },

  createTemplate: async (assignmentData) => {
    const response = await api.post('/v1/inventory/assignments', assignmentData);
    return response.data;
  },

  updateTemplate: async (id, assignmentData) => {
    const response = await api.put(`/v1/inventory/assignments/${id}`, assignmentData);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await api.delete(`/v1/inventory/assignments/${id}`)
    return response.data
  },

  deployToGroup: async (groupId, templateIds, config) => {
    const response = await api.post(`/v1/inventory/assignments/deploy/${groupId}`, { templateIds, deploymentConfig: config })
    return response.data
  },

  // ── Submissions ─────────────────────────────────────────────────────────────
  submitAssignment: (id, formData) => api.post(`/v1/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMySubmission: (id) => api.get(`/v1/assignments/${id}/my-submission`),
  getAllSubmissions: (id) => api.get(`/v1/assignments/${id}/submissions`),
  gradeSubmission: (submissionId, gradeData) => api.post(`/v1/submissions/${submissionId}/grade`, gradeData)
}

export default assignmentService
