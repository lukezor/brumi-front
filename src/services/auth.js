import api from './api.js'

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password })
      const { access_token, token_type } = response.data
      
      localStorage.setItem('auth_token', access_token)
      localStorage.setItem('user_data', JSON.stringify({ username }))
      
      return { access_token, token_type, user: { username } }
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao fazer login')
    }
  },

  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  },

  getToken() {
    return localStorage.getItem('auth_token')
  },

  getUser() {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  },

  isAuthenticated() {
    return !!this.getToken()
  }
}