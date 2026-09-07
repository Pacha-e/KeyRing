import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/properties',
      name: 'properties',
      component: () => import('../views/PropertyList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/properties/new',
      name: 'property-new',
      component: () => import('../views/PropertyForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/properties/:id/edit',
      name: 'property-edit',
      component: () => import('../views/PropertyForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/contracts',
      name: 'contracts',
      component: () => import('../views/ContractList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/contracts/new',
      name: 'contract-new',
      component: () => import('../views/ContractForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/contracts/:id/edit',
      name: 'contract-edit',
      component: () => import('../views/ContractForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/TransactionList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/PropertyMap.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/ReportsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/UserAdmin.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

// Guardas de navegación basadas en el store de autenticación
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard' }
  }
})

export default router
