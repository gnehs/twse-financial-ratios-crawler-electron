import { createApp } from 'vue'
import { createPinia } from 'pinia'
import "./style.sass"
import App from './App.vue'
import './samples/node-api'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})
// pinia
const pinia = createPinia()

createApp(App)
  .use(vuetify)
  .use(pinia)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
