<script setup>
import { ref, onMounted, computed } from 'vue'
import { authService } from '@/services/auth.js'
import { productsService } from '@/services/products.js'
import { getImageUrls, getProductMainImage, hasImages, getImageUrl } from '@/utils/imageUtils.js'

const isAuthenticated = ref(false)
const isLoading = ref(false)
const activeTab = ref('products')

const loginForm = ref({
  username: '',
  password: '',
  showPassword: false
})

const loginError = ref('')

const products = ref([])
const categories = ref([])
const productsLoading = ref(false)
const productsError = ref('')

const editingProduct = ref(null)
const productDialog = ref(false)
const deleteDialog = ref(false)
const productToDelete = ref(null)

const productForm = ref({
  nome: '',
  descricao: '',
  preco: '',
  categorias_ids: [],
  imagens: []
})

const imageFiles = ref([])
const imagePreviews = ref([])

const categoryForm = ref({
  nome: ''
})

const categoryDialog = ref(false)
const categoryError = ref('')
const categoryLoading = ref(false)

const user = computed(() => authService.getUser())

const login = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    loginError.value = 'Username e senha são obrigatórios'
    return
  }

  isLoading.value = true
  loginError.value = ''

  try {
    await authService.login(loginForm.value.username, loginForm.value.password)
    isAuthenticated.value = true
    await loadProducts()
    await loadCategories()
  } catch (error) {
    loginError.value = error.message
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  authService.logout()
  isAuthenticated.value = false
  resetForms()
}

const resetForms = () => {
  loginForm.value = {
    username: '',
    password: '',
    showPassword: false
  }
  productForm.value = {
    name: '',
    description: '',
    price: '',
    categoryId: '',
    images: []
  }
  editingProduct.value = null
  imageFiles.value = []
  imagePreviews.value = []
  categoryForm.value = {
    nome: ''
  }
}

const loadProducts = async () => {
  productsLoading.value = true
  productsError.value = ''

  try {
    const data = await productsService.getProducts()
    products.value = data || []
  } catch (error) {
    productsError.value = error.message
  } finally {
    productsLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    const data = await productsService.getCategories()
    categories.value = data || []
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  }
}

const openProductDialog = (product = null) => {
  editingProduct.value = product
  if (product) {
    productForm.value = {
      nome: product.nome,
      descricao: product.descricao,
      preco: product.preco.toString(),
      categorias_ids: product.categorias ? product.categorias.map(cat => cat.id) : [],
      imagens: product.imagens || []
    }
    // Converte caminhos das imagens para URLs completas para preview
    imagePreviews.value = getImageUrls(product.imagens || [])
  } else {
    resetProductForm()
  }
  productDialog.value = true
}

const resetProductForm = () => {
  productForm.value = {
    nome: '',
    descricao: '',
    preco: '',
    categorias_ids: [],
    imagens: []
  }
  imageFiles.value = []
  imagePreviews.value = []
}

const closeProductDialog = () => {
  productDialog.value = false
  setTimeout(() => {
    resetProductForm()
    editingProduct.value = null
  }, 300)
}

const handleImageChange = (event) => {
  const files = Array.from(event.target.files)
  
  // Conta imagens existentes + novas
  const existingImagesCount = productForm.value.imagens ? productForm.value.imagens.length : 0
  const totalImages = existingImagesCount + files.length
  
  if (totalImages > 5) {
    productsError.value = 'Máximo de 5 imagens permitidas (incluindo as existentes)'
    return
  }
  
  imageFiles.value = files
  
  // Mantém as imagens existentes no preview
  const existingImageUrls = productForm.value.imagens ? getImageUrls(productForm.value.imagens) : []
  imagePreviews.value = [...existingImageUrls]
  
  // Adiciona previews das novas imagens
  files.forEach((file, index) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviews.value[existingImagesCount + index] = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  const existingImagesCount = productForm.value.imagens ? productForm.value.imagens.length : 0
  
  // Remove do preview
  imagePreviews.value.splice(index, 1)
  
  if (index < existingImagesCount) {
    // Remove imagem existente
    productForm.value.imagens.splice(index, 1)
  } else {
    // Remove imagem nova
    const newImageIndex = index - existingImagesCount
    imageFiles.value.splice(newImageIndex, 1)
  }
}

const saveProduct = async () => {
  if (!productForm.value.nome || !productForm.value.descricao || !productForm.value.preco) {
    return
  }

  isLoading.value = true

  try {
    const productData = {
      nome: productForm.value.nome,
      descricao: productForm.value.descricao,
      preco: parseFloat(productForm.value.preco),
      categorias_ids: productForm.value.categorias_ids || []
    }

    let savedProduct
    if (editingProduct.value) {
      savedProduct = await productsService.updateProduct(editingProduct.value.id, productData)
    } else {
      savedProduct = await productsService.createProduct(productData)
    }

    // Upload images if any
    if (imageFiles.value.length > 0) {
      await productsService.addProductImages(savedProduct.id, imageFiles.value)
    }

    await loadProducts()
    closeProductDialog()
  } catch (error) {
    productsError.value = error.message
  } finally {
    isLoading.value = false
  }
}

const openDeleteDialog = (product) => {
  productToDelete.value = product
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!productToDelete.value) return

  isLoading.value = true

  try {
    await productsService.deleteProduct(productToDelete.value.id)
    await loadProducts()
    deleteDialog.value = false
    productToDelete.value = null
  } catch (error) {
    productsError.value = error.message
  } finally {
    isLoading.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

const openCategoryDialog = () => {
  categoryForm.value.nome = ''
  categoryError.value = ''
  categoryDialog.value = true
}

const closeCategoryDialog = () => {
  categoryDialog.value = false
  categoryForm.value.nome = ''
  categoryError.value = ''
}

const saveCategory = async () => {
  if (!categoryForm.value.nome.trim()) {
    categoryError.value = 'Nome da categoria é obrigatório'
    return
  }

  categoryLoading.value = true
  categoryError.value = ''

  try {
    await productsService.createCategory({ nome: categoryForm.value.nome.trim() })
    await loadCategories()
    closeCategoryDialog()
  } catch (error) {
    categoryError.value = error.message
  } finally {
    categoryLoading.value = false
  }
}

onMounted(() => {
  isAuthenticated.value = authService.isAuthenticated()
  if (isAuthenticated.value) {
    loadProducts()
    loadCategories()
  }
})
</script>

<template>
  <v-app>
    <!-- Login Page -->
    <div v-if="!isAuthenticated" class="login-container">
      <v-container class="fill-height">
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card elevation="8" class="login-card">
              <v-card-title class="text-center bg-primary text-white pa-6">
                <v-icon size="48" class="mb-2">mdi-shield-account</v-icon>
                <h2 class="text-h4 font-weight-bold">Admin Login</h2>
                <p class="text-body-1 mt-2 mb-0">BRUMI PRESENTES</p>
              </v-card-title>

              <v-card-text class="pa-6">
                <v-form @submit.prevent="login">
                  <v-text-field
                    v-model="loginForm.username"
                    label="Username"
                    type="text"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    class="mb-4"
                    :disabled="isLoading"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="loginForm.password"
                    :type="loginForm.showPassword ? 'text' : 'password'"
                    label="Senha"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="loginForm.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="loginForm.showPassword = !loginForm.showPassword"
                    variant="outlined"
                    class="mb-4"
                    :disabled="isLoading"
                    required
                  ></v-text-field>

                  <v-alert
                    v-if="loginError"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ loginError }}
                  </v-alert>

                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="isLoading"
                    class="text-none"
                  >
                    Entrar
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Admin Dashboard -->
    <div v-else>
      <v-app-bar color="primary" elevation="0">
        <v-app-bar-title class="text-h5 font-weight-bold text-white">
          <v-icon start>mdi-cog</v-icon>
          Painel Administrativo
        </v-app-bar-title>
        <v-spacer></v-spacer>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              color="white"
              variant="text"
              v-bind="props"
            >
              <v-icon start>mdi-account</v-icon>
              {{ user?.name || 'Admin' }}
              <v-icon end>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="logout">
              <v-list-item-title>
                <v-icon start>mdi-logout</v-icon>
                Sair
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <v-main>
        <v-container class="py-6">
          <v-tabs v-model="activeTab" color="primary" class="mb-6">
            <v-tab value="products">
              <v-icon start>mdi-package-variant</v-icon>
              Produtos
            </v-tab>
            <v-tab value="categories">
              <v-icon start>mdi-tag-multiple</v-icon>
              Categorias
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <!-- Products Tab -->
            <v-window-item value="products">
              <div class="d-flex justify-space-between align-center mb-6">
                <h2 class="text-h4 font-weight-bold text-primary">Produtos</h2>
                <v-btn
                  color="primary"
                  @click="openProductDialog()"
                  class="text-none"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Novo Produto
                </v-btn>
              </div>

              <v-alert
                v-if="productsError"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="productsError = ''"
              >
                {{ productsError }}
              </v-alert>

              <v-card elevation="2">
                <v-data-table
                  :headers="[
                    { title: 'Imagem', key: 'imagens', sortable: false },
                    { title: 'Nome', key: 'nome' },
                    { title: 'Descrição', key: 'descricao', sortable: false },
                    { title: 'Preço', key: 'preco' },
                    { title: 'Categorias', key: 'categorias' },
                    { title: 'Ações', key: 'actions', sortable: false }
                  ]"
                  :items="products"
                  :loading="productsLoading"
                  loading-text="Carregando produtos..."
                  no-data-text="Nenhum produto encontrado"
                  items-per-page="10"
                  class="elevation-0"
                >
                  <template v-slot:item.imagens="{ item }">
                    <div class="d-flex align-center gap-1">
                      <v-avatar 
                        v-for="(imagePath, index) in getImageUrls(item.imagens || []).slice(0, 3)" 
                        :key="index"
                        size="40" 
                        class="my-1"
                      >
                        <v-img :src="imagePath" cover>
                          <template v-slot:error>
                            <v-icon color="grey-lighten-3">mdi-image-off</v-icon>
                          </template>
                        </v-img>
                      </v-avatar>
                      <v-chip 
                        v-if="hasImages(item) && item.imagens.length > 3"
                        size="small"
                        color="primary"
                        variant="tonal"
                      >
                        +{{ item.imagens.length - 3 }}
                      </v-chip>
                      <v-avatar 
                        v-if="!hasImages(item)"
                        size="40" 
                        class="my-1"
                        color="grey-lighten-3"
                      >
                        <v-icon>mdi-image-off</v-icon>
                      </v-avatar>
                    </div>
                  </template>

                  <template v-slot:item.descricao="{ item }">
                    <div class="text-truncate" style="max-width: 200px;">
                      {{ item.descricao }}
                    </div>
                  </template>

                  <template v-slot:item.preco="{ item }">
                    <strong>{{ formatPrice(item.preco) }}</strong>
                  </template>

                  <template v-slot:item.categorias="{ item }">
                    <div class="d-flex flex-wrap gap-1">
                      <v-chip
                        v-for="categoria in item.categorias"
                        :key="categoria.id"
                        color="secondary"
                        size="small"
                        variant="tonal"
                      >
                        {{ categoria.nome }}
                      </v-chip>
                      <span v-if="!item.categorias || item.categorias.length === 0" class="text-grey">Sem categorias</span>
                    </div>
                  </template>

                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      color="primary"
                      variant="text"
                      @click="openProductDialog(item)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      color="error"
                      variant="text"
                      @click="openDeleteDialog(item)"
                    ></v-btn>
                  </template>
                </v-data-table>
              </v-card>
            </v-window-item>

            <!-- Categories Tab -->
            <v-window-item value="categories">
              <div class="d-flex justify-space-between align-center mb-6">
                <h2 class="text-h4 font-weight-bold text-primary">Categorias</h2>
                <v-btn
                  color="primary"
                  @click="openCategoryDialog()"
                  class="text-none"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Nova Categoria
                </v-btn>
              </div>

              <v-card elevation="2">
                <v-data-table
                  :headers="[
                    { title: 'ID', key: 'id' },
                    { title: 'Nome', key: 'nome' }
                  ]"
                  :items="categories"
                  :loading="false"
                  loading-text="Carregando categorias..."
                  no-data-text="Nenhuma categoria encontrada"
                  items-per-page="10"
                  class="elevation-0"
                >
                </v-data-table>
              </v-card>
            </v-window-item>
          </v-window>
        </v-container>
      </v-main>
    </div>

    <!-- Product Dialog -->
    <v-dialog v-model="productDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <span class="text-h5">
            {{ editingProduct ? 'Editar Produto' : 'Novo Produto' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form @submit.prevent="saveProduct">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="productForm.nome"
                  label="Nome do Produto"
                  variant="outlined"
                  required
                  :disabled="isLoading"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="productForm.descricao"
                  label="Descrição"
                  variant="outlined"
                  rows="3"
                  required
                  :disabled="isLoading"
                ></v-textarea>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="productForm.preco"
                  label="Preço"
                  type="number"
                  step="0.01"
                  prefix="R$"
                  variant="outlined"
                  required
                  :disabled="isLoading"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="productForm.categorias_ids"
                  :items="categories"
                  item-title="nome"
                  item-value="id"
                  label="Categorias"
                  variant="outlined"
                  multiple
                  chips
                  clearable
                  :disabled="isLoading"
                ></v-select>
              </v-col>

              <!-- Seção de imagens existentes -->
              <v-col v-if="editingProduct && productForm.imagens && productForm.imagens.length > 0" cols="12">
                <p class="text-subtitle-2 mb-3">Imagens atuais do produto:</p>
                <div class="d-flex flex-wrap gap-3 mb-4">
                  <div 
                    v-for="(imagePath, index) in productForm.imagens" 
                    :key="'existing-' + index"
                    class="position-relative"
                  >
                    <v-img
                      :src="getImageUrl(imagePath)"
                      width="120"
                      height="120"
                      cover
                      class="rounded"
                    ></v-img>
                    <v-btn
                      icon="mdi-close"
                      size="small"
                      color="error"
                      variant="flat"
                      class="position-absolute remove-btn"
                      @click="removeImage(index)"
                    ></v-btn>
                    <v-chip
                      size="x-small"
                      color="info"
                      variant="flat"
                      class="position-absolute existing-chip"
                    >
                      Atual
                    </v-chip>
                  </div>
                </div>
              </v-col>

              <v-col cols="12">
                <v-file-input
                  label="Adicionar novas imagens"
                  accept="image/*"
                  variant="outlined"
                  prepend-icon=""
                  prepend-inner-icon="mdi-camera"
                  multiple
                  @change="handleImageChange"
                  :disabled="isLoading"
                  :hint="editingProduct ? 'Adicione novas imagens ao produto' : 'Selecione até 5 imagens'"
                ></v-file-input>
              </v-col>

              <v-col v-if="imageFiles.length > 0" cols="12">
                <p class="text-subtitle-2 mb-3">Novas imagens selecionadas:</p>
                <div class="d-flex flex-wrap gap-3">
                  <div 
                    v-for="(file, index) in imageFiles" 
                    :key="'new-' + index"
                    class="position-relative"
                  >
                    <v-img
                      :src="imagePreviews[productForm.imagens.length + index]"
                      width="120"
                      height="120"
                      cover
                      class="rounded"
                    ></v-img>
                    <v-btn
                      icon="mdi-close"
                      size="small"
                      color="error"
                      variant="flat"
                      class="position-absolute remove-btn"
                      @click="removeImage(productForm.imagens.length + index)"
                    ></v-btn>
                    <v-chip
                      size="x-small"
                      color="success"
                      variant="flat"
                      class="position-absolute existing-chip"
                    >
                      Nova
                    </v-chip>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeProductDialog"
            :disabled="isLoading"
            class="text-none"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveProduct"
            :loading="isLoading"
            class="text-none"
          >
            {{ editingProduct ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Confirmar Exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir o produto 
          <strong>{{ productToDelete?.nome }}</strong>?
          Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="deleteDialog = false"
            :disabled="isLoading"
            class="text-none"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="isLoading"
            class="text-none"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Category Dialog -->
    <v-dialog v-model="categoryDialog" max-width="400px" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <span class="text-h5">Nova Categoria</span>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form @submit.prevent="saveCategory">
            <v-text-field
              v-model="categoryForm.nome"
              label="Nome da Categoria"
              variant="outlined"
              required
              :disabled="categoryLoading"
              :error-messages="categoryError"
            ></v-text-field>

            <v-alert
              v-if="categoryError"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              {{ categoryError }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeCategoryDialog"
            :disabled="categoryLoading"
            class="text-none"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveCategory"
            :loading="categoryLoading"
            class="text-none"
          >
            Criar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  border-radius: 16px;
  overflow: hidden;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  top: -8px;
  right: -8px;
}

.existing-chip {
  bottom: -8px;
  left: -8px;
}

.gap-1 {
  gap: 4px;
}

.gap-3 {
  gap: 12px;
}
</style>