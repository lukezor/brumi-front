<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productsService } from '@/services/products.js'
import { getImageUrls, getProductMainImage, hasImages } from '@/utils/imageUtils.js'
import ProductImage from '@/components/ProductImage.vue'

const router = useRouter()

const products = ref([])
const categories = ref([])
const loading = ref(false)
const error = ref('')

const filters = ref({
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'name'
})

const pagination = ref({
  page: 1,
  itemsPerPage: 12,
  total: 0
})

const sortOptions = [
  { title: 'Nome (A-Z)', value: 'name' },
  { title: 'Nome (Z-A)', value: '-name' },
  { title: 'Preço (Menor)', value: 'price' },
  { title: 'Preço (Maior)', value: '-price' },
  { title: 'Mais Recentes', value: '-createdAt' }
]

const filteredProducts = computed(() => {
  let filtered = [...products.value]

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(product => 
      product.nome.toLowerCase().includes(search) ||
      product.descricao.toLowerCase().includes(search)
    )
  }

  if (filters.value.category) {
    filtered = filtered.filter(product => 
      product.categorias && product.categorias.some(cat => cat.id === filters.value.category)
    )
  }

  if (filters.value.minPrice) {
    filtered = filtered.filter(product => product.preco >= parseFloat(filters.value.minPrice))
  }

  if (filters.value.maxPrice) {
    filtered = filtered.filter(product => product.preco <= parseFloat(filters.value.maxPrice))
  }

  if (filters.value.sortBy) {
    const sortKey = filters.value.sortBy.replace('-', '')
    const isDescending = filters.value.sortBy.startsWith('-')
    
    filtered.sort((a, b) => {
      let valueA = a[sortKey]
      let valueB = b[sortKey]
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }
      
      if (valueA < valueB) return isDescending ? 1 : -1
      if (valueA > valueB) return isDescending ? -1 : 1
      return 0
    })
  }

  return filtered
})

const paginatedProducts = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.itemsPerPage
  const end = start + pagination.value.itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pagination.value.itemsPerPage)
})

const loadProducts = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('🔄 Carregando produtos...')
    const data = await productsService.getProducts()
    products.value = data || []
    
    console.log('📦 Produtos carregados:', {
      count: products.value.length,
      products: products.value.map(p => ({
        id: p.id,
        nome: p.nome,
        imagens: p.imagens
      }))
    })
  } catch (err) {
    console.error('❌ Erro ao carregar produtos:', err)
    error.value = err.message
    products.value = []
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const data = await productsService.getCategories()
    categories.value = data || []
  } catch (err) {
    console.error('Erro ao carregar categorias:', err)
  }
}

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name'
  }
  pagination.value.page = 1
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

const goToHome = () => {
  router.push('/')
}

const contactWhatsApp = (product) => {
  const message = `Olá! Tenho interesse no produto: ${product.nome} - ${formatPrice(product.preco)}`
  window.open(`https://wa.me/5519991337245?text=${encodeURIComponent(message)}`, '_blank')
}

watch(() => filteredProducts.value.length, () => {
  pagination.value.page = 1
})

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="0" class="nav-bar">
      <v-container class="d-flex align-center">
        <div class="d-flex align-center">
          <v-img 
            src="https://img.icons8.com/?size=100&id=53386&format=png&color=000000"
            alt="BRUMI PRESENTES PERFUMADOS"
            class="logo-img"
          />
          <v-app-bar-title class="text-h5 font-weight-bold text-white ml-2">BRUMI PRESENTES</v-app-bar-title>
        </div>
        <v-spacer></v-spacer>
        <v-btn variant="text" class="text-none text-white" @click="goToHome">
          <v-icon start>mdi-home</v-icon>
          Início
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="main-content">
      <v-container class="py-8">
        <div class="text-center mb-8">
          <h1 class="text-h3 font-weight-bold text-primary mb-4">Catálogo de Produtos</h1>
          <p class="text-h6 text-grey-darken-1">Encontre o presente perfeito para quem você ama</p>
        </div>

        <!-- Filtros -->
        <v-card class="mb-6" elevation="2">
          <v-card-title class="bg-primary text-white">
            <v-icon start>mdi-filter</v-icon>
            Filtros
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filters.search"
                  label="Buscar produtos"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.category"
                  :items="categories"
                  item-title="nome"
                  item-value="id"
                  label="Categoria"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="6" md="2">
                <v-text-field
                  v-model="filters.minPrice"
                  label="Preço mín."
                  type="number"
                  prefix="R$"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="6" md="2">
                <v-text-field
                  v-model="filters.maxPrice"
                  label="Preço máx."
                  type="number"
                  prefix="R$"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="1">
                <v-btn
                  color="secondary"
                  variant="outlined"
                  @click="clearFilters"
                  block
                  size="large"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.sortBy"
                  :items="sortOptions"
                  label="Ordenar por"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="text-h6 mt-4">Carregando produtos...</p>
        </div>

        <!-- Error -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <!-- Resultados -->
        <div v-if="!loading && !error">
          <div class="d-flex justify-space-between align-center mb-4">
            <p class="text-body-1">
              Mostrando {{ paginatedProducts.length }} de {{ filteredProducts.length }} produtos
            </p>
          </div>

          <!-- Grid de Produtos -->
          <v-row v-if="paginatedProducts.length > 0">
            <v-col
              v-for="product in paginatedProducts"
              :key="product.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="product-card h-100"
                elevation="2"
                hover
              >
                <ProductImage
                  :product="product"
                  :height="250"
                />
                
                <div class="product-divider"></div>
                
                <v-card-title class="text-h6 font-weight-bold text-primary">
                  {{ product.nome }}
                </v-card-title>
                
                <v-card-text class="flex-grow-1">
                  <p class="text-body-2 mb-2">{{ product.descricao }}</p>
                  <div class="d-flex flex-wrap gap-1 mb-2" v-if="product.categorias && product.categorias.length > 0">
                    <v-chip
                      v-for="categoria in product.categorias"
                      :key="categoria.id"
                      color="secondary"
                      size="small"
                      variant="tonal"
                    >
                      {{ categoria.nome }}
                    </v-chip>
                  </div>
                  <p class="text-h6 font-weight-bold text-secondary mt-2">
                    {{ formatPrice(product.preco) }}
                  </p>
                </v-card-text>
                
                <v-card-actions class="pa-4">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    class="text-none flex-grow-1"
                  >
                    Ver Detalhes
                  </v-btn>
                  <v-btn
                    color="secondary"
                    variant="flat"
                    size="small"
                    class="text-none flex-grow-1 ml-2"
                    @click="contactWhatsApp(product)"
                  >
                    <v-icon start>mdi-whatsapp</v-icon>
                    Comprar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- Nenhum produto encontrado -->
          <div v-else class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
            <h3 class="text-h5 font-weight-medium text-grey-darken-1 mt-4">
              Nenhum produto encontrado
            </h3>
            <p class="text-body-1 text-grey-darken-1 mt-2">
              Tente ajustar os filtros ou limpar a busca
            </p>
            <v-btn
              color="primary"
              variant="outlined"
              class="mt-4"
              @click="clearFilters"
            >
              Limpar Filtros
            </v-btn>
          </div>

          <!-- Paginação -->
          <v-pagination
            v-if="totalPages > 1"
            v-model="pagination.page"
            :length="totalPages"
            :total-visible="7"
            color="primary"
            class="mt-6"
          ></v-pagination>
        </div>
      </v-container>
    </v-main>

    <v-footer class="footer bg-primary">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="8">
            <p class="text-white mb-0">
              © 2024 BRUMI PRESENTES PERFUMADOS - Todos os direitos reservados
            </p>
          </v-col>
          <v-col cols="12" md="4" class="text-md-right">
            <v-btn
              icon
              color="white"
              variant="text"
              href="https://www.instagram.com/brumipresentes/"
              target="_blank"
              class="mr-2"
            >
              <v-icon>mdi-instagram</v-icon>
            </v-btn>
            <v-btn
              icon
              color="white"
              variant="text"
              href="https://wa.me/5519991337245"
              target="_blank"
            >
              <v-icon>mdi-whatsapp</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<style scoped>
.main-content {
  min-height: calc(100vh - 64px - 80px);
  background-color: #f5f5f5;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.logo-img {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.product-card {
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-image {
  border-radius: 4px 4px 0 0;
}

.product-divider {
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
  margin: 0;
}

.footer {
  margin-top: auto;
  padding: 20px 0;
}

.product-images-container {
  position: relative;
}

.product-carousel {
  border-radius: 4px 4px 0 0;
}

.images-count-chip {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .main-content {
    padding-top: 80px;
  }
}

@media (max-width: 600px) {
  .product-card .v-card-actions .v-btn {
    font-size: 0.75rem;
    padding: 0 8px;
  }
}
</style>