// --- External imports ---
import { createRouter, createWebHistory } from 'vue-router';

// --- Internal imports ---
import { useAuthStore } from '../stores/auth';
import ContractForm from '../views/ContractForm.vue';
import ContractList from '../views/ContractList.vue';
import DashboardView from '../views/DashboardView.vue';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import NotFound from '../views/NotFound.vue';
import PropertyForm from '../views/PropertyForm.vue';
import PropertyList from '../views/PropertyList.vue';
import PropertyMap from '../views/PropertyMap.vue';
import ReportsView from '../views/ReportsView.vue';
import TransactionList from '../views/TransactionList.vue';
import UserAdmin from '../views/UserAdmin.vue';

// --- Constants ---
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/properties',
      name: 'properties',
      component: PropertyList,
      meta: { requiresAuth: true },
    },
    {
      path: '/properties/new',
      name: 'property-new',
      component: PropertyForm,
      meta: { requiresAuth: true },
    },
    {
      path: '/properties/:id/edit',
      name: 'property-edit',
      component: PropertyForm,
      meta: { requiresAuth: true },
    },
    {
      path: '/contracts',
      name: 'contracts',
      component: ContractList,
      meta: { requiresAuth: true },
    },
    {
      path: '/contracts/new',
      name: 'contract-new',
      component: ContractForm,
      meta: { requiresAuth: true },
    },
    {
      path: '/contracts/:id/edit',
      name: 'contract-edit',
      component: ContractForm,
      meta: { requiresAuth: true },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionList,
      meta: { requiresAuth: true },
    },
    {
      path: '/map',
      name: 'map',
      component: PropertyMap,
      meta: { requiresAuth: true },
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: UserAdmin,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
});

// --- Navigation guards ---
router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'dashboard' };
  }
});

export default router;
