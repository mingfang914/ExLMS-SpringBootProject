import api from './api';

export const getQuizzesByGroup = async (groupId) => {
    const response = await api.get(`/v1/groups/${groupId}/quizzes`);
    return response.data;
};

export const getQuiz = async (quizId) => {
    const response = await api.get(`/v1/quizzes/${quizId}`);
    return response.data;
};

export const createQuiz = async (groupId, quizData) => {
    const response = await api.post(`/v1/groups/${groupId}/quizzes`, quizData);
    return response.data;
};

export const startAttempt = async (quizId) => {
    const response = await api.post(`/v1/quizzes/${quizId}/attempts`);
    return response.data;
};

export const submitAttempt = async (attemptId, submissionData) => {
    const response = await api.post(`/v1/quizzes/attempts/${attemptId}/submit`, submissionData);
    return response.data;
};

export const getAttemptResult = async (attemptId) => {
    const response = await api.get(`/v1/quizzes/attempts/${attemptId}/result`);
    return response.data;
};

export const getMyAttempts = async (quizId) => {
    const response = await api.get(`/v1/quizzes/${quizId}/my-attempts`);
    return response.data;
};

export const updateQuiz = async (id, quizData) => {
    const response = await api.put(`/v1/quizzes/${id}`, quizData);
    return response.data;
};

export const deleteQuiz = async (quizId) => {
    const response = await api.delete(`/v1/quizzes/${quizId}`);
    return response.data;
};

// ── Inventory & Deployment ──────────────────────────────────────────────────
export const getInventory = async () => {
    const response = await api.get('/v1/inventory/quizzes');
    return response.data;
};

export const getTemplateById = async (id) => {
    const response = await api.get(`/v1/inventory/quizzes/${id}`);
    return response.data;
};

export const createTemplate = async (quizData) => {
    const response = await api.post('/v1/inventory/quizzes', quizData);
    return response.data;
};

export const updateTemplate = async (id, quizData) => {
    const response = await api.put(`/v1/inventory/quizzes/${id}`, quizData);
    return response.data;
};

export const deleteTemplate = async (id) => {
    const response = await api.delete(`/v1/inventory/quizzes/${id}`);
    return response.data;
};

export const deployToGroup = async (groupId, templateIds, config) => {
    const response = await api.post(`/v1/inventory/quizzes/deploy/${groupId}`, { templateIds, deploymentConfig: config });
    return response.data;
};

export const getQuizStats = async (quizId) => {
    const response = await api.get(`/v1/quizzes/${quizId}/stats`);
    return response.data;
};

export const getAttemptsByDeployment = async (quizId) => {
    const response = await api.get(`/v1/quizzes/${quizId}/attempts`, { params: { type: 'GROUP_QUIZ' } });
    return response.data;
};
