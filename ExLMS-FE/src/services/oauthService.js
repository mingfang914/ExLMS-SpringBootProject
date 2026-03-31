import api from './api'

/**
 * Service xử lý Google OAuth2 Authorization Code flow.
 *
 * Flow:
 * 1. FE nhận authorization_code từ Google (qua @react-oauth/google)
 * 2. FE gọi BE endpoint /auth/oauth2/google với code + redirectUri
 * 3. BE trao đổi code → JWT nội bộ → trả về AuthResponse
 */
const oauthService = {
  /**
   * Đăng nhập bằng Google Authorization Code.
   * @param {string} code - Authorization code nhận từ Google
   * @param {string} redirectUri - URI đã đăng ký trong Google Console (dùng postMessage: window.location.origin)
   * @returns {Promise<AuthResponse>} - JWT token + user info
   */
  loginWithGoogle: async (code, redirectUri) => {
    const response = await api.post('/auth/oauth2/google', { code, redirectUri })
    return response.data
  },
}

export default oauthService
