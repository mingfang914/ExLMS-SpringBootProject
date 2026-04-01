import api from './api';

const courseService = {
  getGroups: async () => {
    const response = await api.get('/groups')
    return response.data
  },

  getGroupById: async (id) => {
    const response = await api.get(`/groups/${id}`)
    return response.data
  },

  createCourse: async (groupId, courseData) => {
    const response = await api.post(`/v1/groups/${groupId}/courses`, courseData)
    return response.data
  },

  getCourseById: async (id) => {
    const response = await api.get(`/v1/inventory/courses/${id}`)
    return response.data
  },

  getCoursesByGroupId: async (groupId) => {
    const response = await api.get(`/v1/groups/${groupId}/courses`)
    return response.data
  },

  getCourseDeploymentById: async (id) => {
    const response = await api.get(`/v1/courses/${id}`)
    return response.data
  },

  updateCourseDeployment: async (id, courseData) => {
    const response = await api.put(`/v1/courses/${id}`, courseData)
    return response.data
  },

  deleteCourseDeployment: async (id) => {
    const response = await api.delete(`/v1/courses/${id}`)
    return response.data
  },

  // ── Inventory & Deployment ──────────────────────────────────────────────────
  getInventory: async () => {
    const response = await api.get('/v1/inventory/courses')
    return response.data
  },

  getTemplateById: async (id) => {
    const response = await api.get(`/v1/inventory/courses/${id}`)
    return response.data
  },

  createTemplate: async (courseData) => {
    const response = await api.post('/v1/inventory/courses', courseData);
    return response.data;
  },

  updateTemplate: async (id, courseData) => {
    const response = await api.put(`/v1/inventory/courses/${id}`, courseData);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await api.delete(`/v1/inventory/courses/${id}`)
    return response.data
  },

  deployToGroup: async (groupId, templateIds, config) => {
    const response = await api.post(`/v1/inventory/courses/deploy/${groupId}`, { templateIds, deploymentConfig: config })
    return response.data
  },

  // ── Chapters & Lessons (Template/Global) ──────────────────────────────────
  getChapters: async (courseId) => {
    const response = await api.get(`/api/courses/${courseId}/chapters`)
    return response.data
  },

  createChapter: async (courseId, data) => {
    const response = await api.post(`/api/courses/${courseId}/chapters`, data)
    return response.data
  },

  updateChapter: async (courseId, chapterId, data) => {
    const response = await api.put(`/api/courses/${courseId}/chapters/${chapterId}`, data)
    return response.data
  },

  deleteChapter: async (courseId, chapterId) => {
    const response = await api.delete(`/api/courses/${courseId}/chapters/${chapterId}`)
    return response.data
  },

  getLessons: async (chapterId) => {
    const response = await api.get(`/api/chapters/${chapterId}/lessons`)
    return response.data
  },

  createLesson: async (chapterId, data) => {
    const response = await api.post(`/api/chapters/${chapterId}/lessons`, data)
    return response.data
  },

  updateLesson: async (chapterId, lessonId, data) => {
    const response = await api.put(`/api/chapters/${chapterId}/lessons/${lessonId}`, data)
    return response.data
  },

  deleteLesson: async (chapterId, lessonId) => {
    const response = await api.delete(`/api/chapters/${chapterId}/lessons/${lessonId}`)
    return response.data
  },

  getQuizzesByCourseId: async (courseId) => {
    const response = await api.get(`/v1/inventory/courses/${courseId}/quizzes`)
    return response.data
  },

  getTemplateChapters: async (courseId) => {
    const response = await api.get(`/api/courses/${courseId}/chapters`)
    return response.data
  },

  getQuizzesByTemplateId: async (courseId) => {
    const response = await api.get(`/v1/inventory/courses/${courseId}/quizzes`)
    return response.data
  },

  getTemplateLessons: async (chapterId) => {
    const response = await api.get(`/api/chapters/${chapterId}/lessons`)
    return response.data
  },

  // ── Quiz Integration ────────────────────────────────────────────────────────
  getQuizById: async (id) => {
    const response = await api.get(`/v1/quizzes/${id}`)
    return response.data;
  },

  createQuiz: async (courseId, quizData) => {
    const response = await api.post(`/v1/courses/${courseId}/quiz`, quizData);
    return response.data;
  },

  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/v1/quizzes/${quizId}`, quizData);
    return response.data;
  }
}

export default courseService
