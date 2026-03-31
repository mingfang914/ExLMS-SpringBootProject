import api from './api'

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (fullName, email, password, desiredRole) => {
    const response = await api.post('/auth/register', { fullName, email, password, desiredRole })
    return response.data
  },

  refreshToken: async (token) => {
    const response = await api.post(`/auth/refresh-token?token=${token}`)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me')
    return response.data
  },

  /**
   * Đăng nhập bằng Google OAuth2 Authorization Code.
   * @param {string} code - Authorization code từ Google
   * @param {string} redirectUri - window.location.origin (postMessage mode)
   */
  loginWithGoogle: async (code, redirectUri) => {
    const response = await api.post('/auth/oauth2/google', { code, redirectUri })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  },
}

export default authService
