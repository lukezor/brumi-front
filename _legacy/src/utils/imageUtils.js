// Utilitários para manipulação de imagens

/**
 * Converte um caminho de imagem do backend para URL completa
 * @param {string} imagePath - Caminho da imagem retornado pelo backend
 * @returns {string} URL completa da imagem
 */
export function getImageUrl(imagePath) {
  if (!imagePath) {
    console.warn('⚠️ getImageUrl: imagePath está vazio:', imagePath)
    return null
  }
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  
  // Remove barras invertidas do Windows e normaliza o caminho
  const normalizedPath = imagePath.replace(/\\/g, '/')
  
  // Se já é uma URL completa, retorna como está
  if (normalizedPath.startsWith('http')) {
    console.log('🔗 getImageUrl: URL já completa:', normalizedPath)
    return normalizedPath
  }
  
  // Constrói a URL completa
  const fullUrl = `${API_BASE}/${normalizedPath}`
  console.log('🔗 getImageUrl: Convertendo:', imagePath, '→', fullUrl)
  return fullUrl
}

/**
 * Converte um array de caminhos de imagem para URLs completas
 * @param {string[]} imagePaths - Array de caminhos de imagem
 * @returns {string[]} Array de URLs completas
 */
export function getImageUrls(imagePaths) {
  if (!imagePaths || !Array.isArray(imagePaths)) return []
  
  return imagePaths
    .filter(path => path && path.trim()) // Remove caminhos vazios
    .map(path => getImageUrl(path))
}

/**
 * Retorna a primeira imagem de um produto ou uma imagem padrão
 * @param {Object} product - Objeto do produto
 * @returns {string} URL da primeira imagem ou imagem padrão
 */
export function getProductMainImage(product) {
  if (product?.imagens && product.imagens.length > 0) {
    return getImageUrl(product.imagens[0])
  }
  
  // Imagem padrão se não houver imagens
  return `https://picsum.photos/400/300?random=${product?.id || Math.random()}`
}

/**
 * Verifica se um produto tem imagens
 * @param {Object} product - Objeto do produto
 * @returns {boolean} True se o produto tem imagens
 */
export function hasImages(product) {
  return product?.imagens && Array.isArray(product.imagens) && product.imagens.length > 0
}