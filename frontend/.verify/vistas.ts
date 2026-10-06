// Renderiza las vistas reales con SSR para comprobar que el template compila y
// que el setup corre sin errores. Con la arquitectura API los datos llegan de
// forma asíncrona en onMounted, que NO corre en SSR: aquí se valida la
// estructura estática (titulos, botones, columnas, selectores), no los datos.
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory, type Component } from 'vue-router'
import { useAuthStore } from '../src/stores/auth'
import type { SessionUser } from '../src/services/auth.service'
import { UserRole } from '../src/interfaces/enums'

import ContractList from '../src/views/ContractList.vue'
import PropertyList from '../src/views/PropertyList.vue'
import TransactionList from '../src/views/TransactionList.vue'
import ReportsView from '../src/views/ReportsView.vue'
import UserAdmin from '../src/views/UserAdmin.vue'
import DashboardView from '../src/views/DashboardView.vue'
import PropertyForm from '../src/views/PropertyForm.vue'
import PropertyMap from '../src/views/PropertyMap.vue'
import LoginView from '../src/views/LoginView.vue'

let fallos = 0
const ok = (cond: boolean, msg: string) => {
  console.log((cond ? '  PASS   ' : '  FALLA  ') + msg)
  if (!cond) fallos++
}

const vacio = { template: '<div />' }
const rutas = [
  'home',
  'login',
  'dashboard',
  'properties',
  'property-new',
  'property-edit',
  'contracts',
  'contract-new',
  'contract-edit',
  'transactions',
  'map',
  'reports',
  'admin-users',
].map((name) => ({ path: '/' + name, name, component: vacio }))

/** Usuario de prueba con el que se hidrata la store antes de renderizar. */
const ADMIN: SessionUser = {
  id: '00000000-0000-4000-8000-000000000001',
  fullName: 'Admin KeyRing',
  email: 'admin@keyring.co',
  phone: '3001112233',
  city: 'Medellin',
  memberSince: '2026-01-01',
  role: UserRole.ADMIN,
}

async function render(componente: Component, ruta = '/dashboard'): Promise<string> {
  const app = createSSRApp(componente)
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.user = ADMIN
  const router = createRouter({ history: createMemoryHistory(), routes: rutas })
  app.use(pinia)
  app.use(router)
  router.push(ruta)
  await router.isReady()
  return renderToString(app)
}

async function main() {
  // ------------------------------------------------------------------ #12
  console.log('\n#12 - Vista de Contratos (render real)')
  const contratos = await render(ContractList, '/contracts')
  ok(contratos.includes('Contratos'), 'la vista renderiza su titulo')
  ok(contratos.includes('+ Nuevo contrato'), 'expone el boton de crear contrato')
  ok(contratos.includes('Editar'), 'expone la accion de editar')
  ok(contratos.includes('Eliminar'), 'expone la accion de eliminar')
  ok(contratos.includes('Arrendatario'), 'incluye la columna del arrendatario')
  ok(contratos.includes('Estado'), 'incluye la columna de estado')

  // ------------------------------------------------------------------ #11
  console.log('\n#11 - Vista de Propiedades (render real)')
  const propiedades = await render(PropertyList, '/properties')
  ok(propiedades.includes('Propiedades'), 'la vista renderiza su titulo')
  ok(
    propiedades.includes('Ciudad') &&
      propiedades.includes('Tipo') &&
      propiedades.includes('Estado'),
    'los 3 selectores de filtro estan presentes',
  )
  ok(propiedades.includes('Ingreso estimado por ciudad'), 'incluye el grafico exigido por el issue')
  ok(propiedades.includes('Eliminar'), 'expone la accion de eliminar')

  const formulario = await render(PropertyForm, '/property-new')
  ok(formulario.includes('Nueva propiedad'), 'el formulario distingue alta de edicion')
  ok(formulario.includes('Arriendo mensual estimado'), 'el formulario trae los campos del diagrama')

  // ------------------------------------------------------------------ #17
  console.log('\n#17 - Vista de Transacciones (render real)')
  const transacciones = await render(TransactionList, '/transactions')
  ok(transacciones.includes('Transacciones'), 'la vista renderiza su titulo')
  ok(
    transacciones.includes('Tipo') &&
      transacciones.includes('Fuente') &&
      transacciones.includes('Mes'),
    'los 3 selectores del issue estan presentes',
  )
  ok(transacciones.includes('Ingresos vs gastos por mes'), 'incluye el grafico')

  // ------------------------------------------------------------------ #19
  console.log('\n#19 - Vista de Reportes (render real)')
  const reportes = await render(ReportsView, '/reports')
  ok(reportes.includes('Tipo de propiedad'), 'selector de tipo de propiedad')
  ok(
    reportes.includes('Desde (mes)') && reportes.includes('Hasta (mes)'),
    'selectores de rango de meses',
  )
  ok(reportes.includes('Utilidad por ciudad'), 'grafico de utilidad por ciudad')
  ok(reportes.includes('Ingresos por fuente'), 'grafico de ingresos por fuente')
  ok(reportes.includes('Neto (COP)'), 'tabla resumen con la columna de utilidad')

  // ------------------------------------------------------------------ #20
  console.log('\n#20 - Vista de Usuarios (render real)')
  const usuarios = await render(UserAdmin, '/admin-users')
  ok(usuarios.includes('Usuarios'), 'la vista renderiza su titulo')
  ok(usuarios.includes('Miembro desde'), 'incluye la columna miembro desde')
  ok(
    !usuarios.includes('admin123') && !usuarios.includes('user123'),
    'nunca imprime passwords reales',
  )

  // ------------------------------------------------------------------ mapa
  console.log('\nMapa (render real)')
  const mapa = await render(PropertyMap, '/map')
  ok(mapa.includes('Mapa de propiedades'), 'la vista renderiza su titulo')

  // ------------------------------------------------------------------ login
  console.log('\nLogin (render real)')
  const loginView = await render(LoginView, '/login')
  ok(loginView.includes('Entrar'), 'renderiza el formulario de acceso')

  // ------------------------------------------------------------------ dashboard
  console.log('\nDashboard (render real)')
  const dashboard = await render(DashboardView, '/dashboard')
  ok(dashboard.includes('Dashboard'), 'el dashboard renderiza sus tarjetas')

  console.log('\n' + (fallos === 0 ? 'TODO VERDE' : fallos + ' FALLAS'))
  if (fallos > 0) process.exitCode = 1
}

main()
