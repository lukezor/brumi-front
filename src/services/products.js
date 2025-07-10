import api from './api.js'

export const productsService = {
  async getProducts(params = {}) {
    try {
      const response = await api.get('/produtos/', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar produtos')
    }
  },

  async getProduct(id) {
    try {
      const response = await api.get(`/produtos/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar produto')
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/produtos/', productData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao criar produto')
    }
  },

  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/produtos/${id}`, productData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao atualizar produto')
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/produtos/${id}`)
      return true
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao deletar produto')
    }
  },

  async getCategories() {
    try {
      const response = await api.get('/categorias/')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar categorias')
    }
  },

  async addProductImages(productId, files) {
    try {
      const formData = new FormData()
      
      // Add each file to FormData
      for (let i = 0; i < files.length; i++) {
        formData.append('imagens', files[i])
      }
      
      const response = await api.post(`/produtos/${productId}/imagens/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao fazer upload das imagens')
    }
  },

  async removeProductImage(productId, imageIndex) {
    try {
      const response = await api.delete(`/produtos/${productId}/imagens/${imageIndex}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao remover imagem')
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await api.post('/categorias/', categoryData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erro ao criar categoria')
    }
  }
}