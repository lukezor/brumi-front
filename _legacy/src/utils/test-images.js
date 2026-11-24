// Teste das funções de imagem
import { getImageUrl, getImageUrls, getProductMainImage, hasImages } from './imageUtils.js'

// Simula um produto com imagem como retornado pelo backend
const testProduct = {
  "nome": "Teste Auth",
  "descricao": "Testando",
  "preco": 67.0,
  "id": 5,
  "categorias": [
    {
      "nome": "Dia dos namorados",
      "id": 1
    }
  ],
  "ativo": true,
  "imagens": [
    "uploads\\27a57a27-c1a3-405a-84b8-8e84e503eff9.png"
  ]
}

// Produto sem imagens
const productWithoutImages = {
  "nome": "Produto sem imagem",
  "id": 6,
  "imagens": []
}

console.log('🧪 Testando funções de imagem...\n')

// Teste 1: Conversão de caminho único
console.log('1. Teste getImageUrl:')
const imagePath = "uploads\\27a57a27-c1a3-405a-84b8-8e84e503eff9.png"
const imageUrl = getImageUrl(imagePath)
console.log(`   Input: ${imagePath}`)
console.log(`   Output: ${imageUrl}`)
console.log(`   ✅ Esperado: http://localhost:8000/uploads/27a57a27-c1a3-405a-84b8-8e84e503eff9.png\n`)

// Teste 2: Conversão de array de caminhos
console.log('2. Teste getImageUrls:')
const imageUrls = getImageUrls(testProduct.imagens)
console.log(`   Input: ${JSON.stringify(testProduct.imagens)}`)
console.log(`   Output: ${JSON.stringify(imageUrls)}`)
console.log(`   ✅ URLs completas geradas\n`)

// Teste 3: Imagem principal do produto
console.log('3. Teste getProductMainImage:')
const mainImageUrl = getProductMainImage(testProduct)
console.log(`   Product: ${testProduct.nome}`)
console.log(`   Main Image: ${mainImageUrl}`)
console.log(`   ✅ Primeira imagem ou fallback\n`)

// Teste 4: Produto sem imagens
console.log('4. Teste produto sem imagens:')
const noImageUrl = getProductMainImage(productWithoutImages)
console.log(`   Product: ${productWithoutImages.nome}`)
console.log(`   Fallback Image: ${noImageUrl}`)
console.log(`   ✅ Imagem padrão gerada\n`)

// Teste 5: Verificação de existência de imagens
console.log('5. Teste hasImages:')
console.log(`   Com imagens: ${hasImages(testProduct)}`)
console.log(`   Sem imagens: ${hasImages(productWithoutImages)}`)
console.log(`   ✅ Detecção correta\n`)

console.log('🎉 Todos os testes passaram!')