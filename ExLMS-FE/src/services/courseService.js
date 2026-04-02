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

  getTemplateById: async (id) => {
    const response = await api.get(`/v1/inventory/courses/${id}`)
    return response.data
  },

  getCoursesByGroupId: async (groupId) => {
    const response = await api.get(`/v1/groups/${groupId}/courses`)
    return response.data
  },

  getCourseDeploymentById: async (groupId, id) => {
    const response = await api.get(`/v1/groups/${groupId}/courses/${id}`)
    return response.data
  },

  updateCourse: async (groupId, id, courseData) => {
    const response = await api.put(`/v1/groups/${groupId}/courses/${id}`, courseData)
    return response.data
  },

  getCourseById: async (groupId, courseId) => {
    // This is fetching a group-course deployment
    const response = await api.get(`/v1/groups/${groupId}/courses/${courseId}`)
    return response.data
  },

  deleteCourse: async (groupId, id) => {
    const response = await api.delete(`/v1/groups/${groupId}/courses/${id}`)
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
    const response = await api.get(`/v1/courses/${courseId}/chapters`)
    return response.data
  },

  createChapter: async (courseId, data) => {
    const response = await api.post(`/v1/courses/${courseId}/chapters`, data)
    return response.data
  },

  updateChapter: async (courseId, chapterId, data) => {
    const response = await api.put(`/v1/courses/${courseId}/chapters/${chapterId}`, data)
    return response.data
  },

  deleteChapter: async (courseId, chapterId) => {
    const response = await api.delete(`/v1/courses/${courseId}/chapters/${chapterId}`)
    return response.data
  },

  getLessons: async (chapterId) => {
    const response = await api.get(`/v1/chapters/${chapterId}/lessons`)
    return response.data
  },

  createLesson: async (chapterId, data) => {
    const response = await api.post(`/v1/chapters/${chapterId}/lessons`, data)
    return response.data
  },

  updateLesson: async (chapterId, lessonId, data) => {
    const response = await api.put(`/v1/chapters/${chapterId}/lessons/${lessonId}`, data)
    return response.data
  },

  deleteLesson: async (chapterId, lessonId) => {
    const response = await api.delete(`/v1/chapters/${chapterId}/lessons/${lessonId}`)
    return response.data
  },

  getQuizzesByCourseId: async (courseId) => {
    const response = await api.get(`/v1/inventory/courses/${courseId}/quizzes`)
    return response.data
  },

  getTemplateChapters: async (courseId) => {
    const response = await api.get(`/v1/courses/${courseId}/chapters`)
    return response.data
  },

  getQuizzesByTemplateId: async (courseId) => {
    const response = await api.get(`/v1/inventory/courses/${courseId}/quizzes`)
    return response.data
  },

  associateQuizzes: async (courseId, quizIds) => {
    const response = await api.post(`/v1/inventory/courses/${courseId}/quizzes`, quizIds)
    return response.data
  },

  getTemplateLessons: async (chapterId) => {
    const response = await api.get(`/v1/chapters/${chapterId}/lessons`)
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
  },

  // ── Enrollment ──────────────────────────────────────────────────────────────
  getMyEnrollment: async (groupCourseId) => {
    const response = await api.get(`/v1/group-courses/${groupCourseId}/enrollment/my`)
    return response.status === 204 ? null : response.data
  },

  enrollCourse: async (groupCourseId) => {
    const response = await api.post(`/v1/group-courses/${groupCourseId}/enrollment`)
    return response.data
  },

  markLessonComplete: async (chapterId, lessonId) => {
    const response = await api.post(`/v1/chapters/${chapterId}/lessons/${lessonId}/complete`)
    return response.data
  }
}

export default courseService
