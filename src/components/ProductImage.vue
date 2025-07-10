<template>
  <div class="product-image-container">
    <!-- Múltiplas imagens - Carousel -->
    <v-carousel
      v-if="imageUrls.length > 1"
      :height="height"
      hide-delimiters
      show-arrows="hover"
      cycle
      :interval="4000"
      class="product-carousel"
    >
      <v-carousel-item
        v-for="(imageUrl, index) in imageUrls"
        :key="index"
      >
        <v-img
          :src="imageUrl"
          :height="height"
          cover
          class="product-image"
          @error="onImageError(index)"
          @load="onImageLoad(index)"
        >
          <template v-slot:placeholder>
            <v-row
              class="fill-height ma-0"
              align="center"
              justify="center"
            >
              <v-progress-circular
                indeterminate
                color="grey-lighten-5"
              ></v-progress-circular>
            </v-row>
          </template>
          <template v-slot:error>
            <v-row
              class="fill-height ma-0"
              align="center"
              justify="center"
            >
              <v-icon size="64" color="grey-lighten-3">mdi-image-off</v-icon>
            </v-row>
          </template>
        </v-img>
      </v-carousel-item>
    </v-carousel>
    
    <!-- Imagem única ou fallback -->
    <v-img
      v-else
      :src="mainImageUrl"
      :height="height"
      cover
      class="product-image"
      @error="onImageError(0)"
      @load="onImageLoad(0)"
    >
      <template v-slot:placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular
            indeterminate
            color="grey-lighten-5"
          ></v-progress-circular>
        </v-row>
      </template>
      <template v-slot:error>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-icon size="64" color="grey-lighten-3">mdi-image-off</v-icon>
        </v-row>
      </template>
    </v-img>

    <!-- Contador de imagens -->
    <v-chip
      v-if="imageUrls.length > 1"
      color="primary"
      size="small"
      class="images-count-chip"
    >
      <v-icon start size="small">mdi-camera</v-icon>
      {{ imageUrls.length }}
    </v-chip>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getImageUrls, getProductMainImage } from '@/utils/imageUtils.js'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  height: {
    type: [Number, String],
    default: 250
  }
})

const loadedImages = ref(new Set())
const errorImages = ref(new Set())

// URLs das imagens processadas
const imageUrls = computed(() => {
  if (!props.product?.imagens || !Array.isArray(props.product.imagens)) {
    return []
  }
  
  return getImageUrls(props.product.imagens)
})

// URL da imagem principal (primeira ou fallback)
const mainImageUrl = computed(() => {
  return getProductMainImage(props.product)
})

// Reage a mudanças no produto
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    // Reset do estado de carregamento quando o produto muda
    loadedImages.value.clear()
    errorImages.value.clear()
    
    // Debug log
    console.log('🖼️ ProductImage: Produto carregado:', {
      nome: newProduct.nome,
      imagens: newProduct.imagens,
      imageUrls: imageUrls.value
    })
  }
}, { immediate: true, deep: true })

const onImageLoad = (index) => {
  loadedImages.value.add(index)
  console.log('✅ Imagem carregada:', index, imageUrls.value[index])
}

const onImageError = (index) => {
  errorImages.value.add(index)
  console.error('❌ Erro ao carregar imagem:', index, imageUrls.value[index])
}
</script>

<style scoped>
.product-image-container {
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
</style>