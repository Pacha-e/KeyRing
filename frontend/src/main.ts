import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { APP_NAME } from './config/app.config'
import './assets/main.css'

// El título de la pestaña sale de la configuración, no del HTML.
document.title = `${APP_NAME} — Gestión de arriendos`

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
