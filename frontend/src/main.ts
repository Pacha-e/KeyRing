// --- External imports ---
import { createApp } from 'vue';

// --- Internal imports ---
import App from './App.vue';
import './assets/main.css';
import { APP_NAME } from './config/app.config';
import router from './router';
import { useAuthStore } from './stores/auth';
import { PiniaConfig } from './stores/PiniaConfig';
import { HttpClient } from './utils/HttpClient';

// --- Application initialization ---
document.title = `${APP_NAME} - Rental management`;
const app = createApp(App);
app.use(PiniaConfig.init());
const authStore = useAuthStore();
if (authStore.isAuthenticated) HttpClient.setToken(authStore.token);
else authStore.clearSession();
HttpClient.configureUnauthorizedHandler(() => {
  authStore.clearSession();
  if (router.currentRoute.value.name !== 'login') {
    void router.replace({ name: 'login' });
  }
});
app.use(router);
app.mount('#app');
