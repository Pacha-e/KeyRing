// --- External imports ---
import { createApp } from 'vue';

// --- Internal imports ---
import App from './App.vue';
import './assets/main.css';
import { APP_NAME } from './config/app.config';
import router from './router';
import { PiniaConfig } from './stores/PiniaConfig';

// --- Application initialization ---
document.title = `${APP_NAME} - Rental management`;
const app = createApp(App);
app.use(PiniaConfig.init());
app.use(router);
app.mount('#app');
