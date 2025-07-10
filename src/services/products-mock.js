// Mock products service for testing without real API
let mockProducts = [
  {
    id: 1,
    name: 'Cesta Especial',
    description: 'Uma seleção especial de produtos para presentear quem você ama.',
    price: 199.90,
    categoryId: 1,
    category: 'Cestas',
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=11',
      'https://picsum.photos/400/300?random=21'
    ],
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Kit Perfumado',
    description: 'Kit com produtos perfumados para todos os gostos.',
    price: 159.90,
    categoryId: 2,
    category: 'Kits',
    images: [
      'https://picsum.photos/400/300?random=2',
      'https://picsum.photos/400/300?random=12'
    ],
    createdAt: '2024-01-02'
  },
  {
    id: 3,
    name: 'Cesta Premium',
    description: 'Produtos selecionados com o melhor custo-benefício.',
    price: 249.90,
    categoryId: 1,
    category: 'Cestas',
    images: [
      'https://picsum.photos/400/300?random=3',
      'https://picsum.photos/400/300?random=13',
      'https://picsum.photos/400/300?random=23',
      'https://picsum.photos/400/300?random=33'
    ],
    createdAt: '2024-01-03'
  }
]

let mockCategories = [
  { id: 1, name: 'Cestas', createdAt: '2024-01-01' },
  { id: 2, name: 'Kits', createdAt: '2024-01-01' },
  { id: 3, name: 'Presentes Especiais', createdAt: '2024-01-01' }
]

let nextProductId = 4
let nextCategoryId = 4

export const productsService = {
  async getProducts(params = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...mockProducts]
  },

  async getProduct(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const product = mockProducts.find(p => p.id === parseInt(id))
    if (!product) {
      throw new Error('Produto não encontrado')
    }
    return product
  },

  async createProduct(productData) {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const newProduct = {
      ...productData,
      id: nextProductId++,
      createdAt: new Date().toISOString().split('T')[0],
      category: mockCategories.find(c => c.id === productData.categoryId)?.name || null
    }
    
    mockProducts.push(newProduct)
    return newProduct
  },

  async updateProduct(id, productData) {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const index = mockProducts.findIndex(p => p.id === parseInt(id))
    if (index === -1) {
      throw new Error('Produto não encontrado')
    }
    
    mockProducts[index] = {
      ...mockProducts[index],
      ...productData,
      category: mockCategories.find(c => c.id === productData.categoryId)?.name || null
    }
    
    return mockProducts[index]
  },

  async deleteProduct(id) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockProducts.findIndex(p => p.id === parseInt(id))
    if (index === -1) {
      throw new Error('Produto não encontrado')
    }
    
    mockProducts.splice(index, 1)
    return true
  },

  async getCategories() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockCategories]
  },

  async uploadImages(files) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate multiple image upload - return mock URLs
    const urls = []
    for (let i = 0; i < files.length; i++) {
      const randomId = Math.floor(Math.random() * 1000) + Date.now() + i
      urls.push(`https://picsum.photos/400/300?random=${randomId}`)
    }
    return urls
  },

  async createCategory(categoryData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check if category name already exists
    const existingCategory = mockCategories.find(c => 
      c.name.toLowerCase() === categoryData.name.toLowerCase()
    )
    
    if (existingCategory) {
      throw new Error('Categoria já existe')
    }
    
    const newCategory = {
      id: nextCategoryId++,
      name: categoryData.name,
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    mockCategories.push(newCategory)
    return newCategory
  }
}