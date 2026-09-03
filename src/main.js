import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { seedDatabase } from './services/seed'
import './assets/main.css'

// Datos ficticios en LocalStorage la primera vez que se abre la app
seedDatabase()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
