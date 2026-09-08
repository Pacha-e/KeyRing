import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { seedDatabase } from './services/seed'
import { APP_NAME } from './config/app.config'
import './assets/main.css'

// Datos ficticios en LocalStorage la primera vez que se abre la app.
// Va antes de montar: el store de sesión se hidrata al crearse y necesita
// que los usuarios ya existan.
seedDatabase()

// El título de la pestaña sale de la configuración, no del HTML
document.title = `${APP_NAME} — Gestión de arriendos`

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
