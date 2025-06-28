<template>
  <div class="instagram-embed-container">
    <div class="instagram-embed" v-html="embedCode"></div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'

const props = defineProps({
  embedCode: {
    type: String,
    required: true
  }
})

const processInstagramEmbeds = () => {
  if (window.instgrm) {
    window.instgrm.Embeds.process()
  }
}

onMounted(() => {
  processInstagramEmbeds()
})

watch(() => props.embedCode, () => {
  processInstagramEmbeds()
})
</script>

<style scoped>
.instagram-embed-container {
  width: 350px;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  flex-shrink: 0;
}

.instagram-embed {
  position: relative;
  background: white;
  padding: 2px;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.instagram-embed::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  padding: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}

.instagram-embed iframe {
  border-radius: 6px;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 0;
}

.instagram-embed :deep(blockquote) {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.instagram-embed :deep(iframe) {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
}

@media (max-width: 960px) {
  .instagram-embed-container {
    width: 350px;
    height: 450px;
    margin: 0 5px;
  }
}

@media (max-width: 600px) {
  .instagram-embed-container {
    width: 300px;
    height: 400px;
    margin: 0;
  }
}
</style> 