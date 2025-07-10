// Mock service for testing without real API
export const authService = {
  async login(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock admin credentials
    if (email === 'admin@brumi.com' && password === 'admin123') {
      const mockData = {
        token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          name: 'Admin BRUMI',
          email: 'admin@brumi.com'
        }
      }
      
      localStorage.setItem('auth_token', mockData.token)
      localStorage.setItem('user_data', JSON.stringify(mockData.user))
      
      return mockData
    } else {
      throw new Error('Email ou senha incorretos')
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