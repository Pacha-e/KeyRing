// Renderiza las vistas reales con SSR para comprobar que el template compila,
// que el setup corre sin errores y que los datos sembrados llegan a la pantalla.
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory, type Component } from 'vue-router'
import { seedDatabase } from '../src/services/seed'
import { login } from '../src/services/auth.service'

import ContractList from '../src/views/ContractList.vue'
import PropertyList from '../src/views/PropertyList.vue'
import TransactionList from '../src/views/TransactionList.vue'
import ReportsView from '../src/views/ReportsView.vue'
import UserAdmin from '../src/views/UserAdmin.vue'
import DashboardView from '../src/views/DashboardView.vue'
import PropertyForm from '../src/views/PropertyForm.vue'

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

async function render(componente: Component, ruta = '/dashboard'): Promise<string> {
  const app = createSSRApp(componente)
  const router = createRouter({ history: createMemoryHistory(), routes: rutas })
  app.use(createPinia())
  app.use(router)
  router.push(ruta)
  await router.isReady()
  return renderToString(app)
}

async function main() {
  seedDatabase()
  login('admin@keyring.co', 'admin123')

  // ------------------------------------------------------------------ #12
  console.log('\n#12 - Vista de Contratos (render real)')
  const contratos = await render(ContractList, '/contracts')
  ok(contratos.includes('Contratos'), 'la vista renderiza su titulo')
  ok(contratos.includes('+ Nuevo contrato'), 'expone el boton de crear contrato')
  ok(
    contratos.includes('Carlos Ríos') && contratos.includes('María Gómez'),
    'lista los arrendatarios sembrados',
  )
  ok(contratos.includes('Casa Laureles'), 'resuelve el nombre de la propiedad de cada contrato')
  ok(contratos.includes('3105551234'), 'muestra la columna de contacto')
  ok(
    contratos.includes('Activo') && contratos.includes('Vencido'),
    'muestra los estados en espanol',
  )
  ok(
    (contratos.match(/Editar/g) ?? []).length === 4,
    'una accion Editar por cada uno de los 4 contratos',
  )
  ok((contratos.match(/Eliminar/g) ?? []).length === 4, 'una accion Eliminar por cada contrato')
  ok(!contratos.includes('Nuevo contrato</h2>'), 'el formulario arranca oculto')

  // ------------------------------------------------------------------ #11
  console.log('\n#11 - Vista de Propiedades (render real)')
  const propiedades = await render(PropertyList, '/properties')
  ok(propiedades.includes('Apartamento El Poblado'), 'lista las propiedades sembradas')
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
  ok(
    transacciones.includes('+ Nueva transaccion') || transacciones.includes('+ Nueva transacción'),
    'expone el boton de crear',
  )
  ok(
    transacciones.includes('Tipo') &&
      transacciones.includes('Fuente') &&
      transacciones.includes('Mes'),
    'los 3 selectores del issue estan presentes',
  )
  ok(transacciones.includes('Ingresos vs gastos por mes'), 'incluye el grafico')
  ok(transacciones.includes('Reserva Airbnb 3 noches'), 'lista las transacciones sembradas')

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
  ok(
    usuarios.includes('Admin KeyRing') && usuarios.includes('Usuario Demo'),
    'lista los 2 usuarios',
  )
  ok(
    usuarios.includes('Administrador') && usuarios.includes('Usuario'),
    'muestra los roles en espanol',
  )
  ok(
    !usuarios.includes('admin123') && !usuarios.includes('user123'),
    'nunca imprime los passwords reales',
  )
  ok(usuarios.includes('Miembro desde'), 'incluye la columna miembro desde')
  ok(
    (usuarios.match(/Eliminar/g) ?? []).length === 1,
    'el admin de la sesion no tiene boton Eliminar (solo el otro usuario)',
  )

  // ------------------------------------------------------------------ dashboard
  console.log('\nDashboard (render real)')
  const dashboard = await render(DashboardView, '/dashboard')
  ok(dashboard.includes('Propiedades'), 'el dashboard renderiza sus tarjetas')

  console.log('\n' + (fallos === 0 ? 'TODO VERDE' : fallos + ' FALLAS'))
  if (fallos > 0) process.exitCode = 1
}

main()
