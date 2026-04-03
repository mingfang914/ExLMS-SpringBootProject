import api from './api'

const assignmentService = {
  createAssignment: (groupId, data) => api.post(`/v1/groups/${groupId}/assignments`, data),
  getAssignmentsByGroup: async (groupId) => {
    const response = await api.get(`/v1/groups/${groupId}/assignments`)
    return response.data
  },
  getAssignmentById: async (id) => {
    const response = await api.get(`/v1/assignments/${id}`)
    return response.data
  },
  updateAssignment: async (id, data) => {
    const response = await api.put(`/v1/assignments/${id}`, data)
    return response.data
  },
  deleteAssignment: async (id) => {
    const response = await api.delete(`/v1/assignments/${id}`)
    return response.data
  },

  // ── Inventory & Deployment ──────────────────────────────────────────────────
  getInventory: async () => {
    const response = await api.get('/v1/inventory/assignments')
    return response.data
  },

  getTemplateById: async (id) => {
    const response = await api.get(`/v1/inventory/assignments/${id}`)
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
  submitAssignment: async (id, formData) => {
    const response = await api.post(`/v1/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  getMySubmissions: async (id) => {
    const response = await api.get(`/v1/assignments/${id}/my-submissions`)
    return response.data
  },
  getAllSubmissions: async (id) => {
    const response = await api.get(`/v1/assignments/${id}/submissions`)
    return response.data
  },
  gradeSubmission: async (submissionId, gradeData) => {
    const response = await api.post(`/v1/submissions/${submissionId}/grade`, gradeData)
    return response.data
  },
  updateSubmission: async (id, formData) => {
    const response = await api.put(`/v1/submissions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  deleteSubmission: async (id) => {
    const response = await api.delete(`/v1/submissions/${id}`)
    return response.data
  },
  exportGrades: async (id) => {
    const response = await api.get(`/v1/assignments/${id}/export-grades`, { responseType: 'blob' })
    return response.data
  }
}

export default assignmentService
