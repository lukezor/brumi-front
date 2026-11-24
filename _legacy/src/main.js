import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'brumiTheme',
    themes: {
      brumiTheme: {
        dark: false,
        colors: {
          primary: '#1E88E5', // Azul principal
          secondary: '#0D47A1', // Azul escuro
          accent: '#64B5F6', // Azul claro
          background: '#FFFFFF',
          surface: '#E3F2FD', // Azul muito claro para fundos
          error: '#B00020',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        }
      }
    }
  }
})

createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')
