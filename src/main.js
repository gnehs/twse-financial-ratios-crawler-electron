import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from "vue3-apexcharts";
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import "./style.sass"
import App from './App.vue'

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
  .use(VueApexCharts)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
