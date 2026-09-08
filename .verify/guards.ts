// Ejercita los guards reales de src/router/index.ts navegando por URL directa.
import { setActivePinia, createPinia } from 'pinia'
import router from '../src/router'
import { useAuthStore } from '../src/stores/auth'
import { seedDatabase } from '../src/services/seed'

let fallos = 0
const ok = (cond: boolean, msg: string) => {
  console.log((cond ? '  PASS   ' : '  FALLA  ') + msg)
  if (!cond) fallos++
}

async function irA(url: string): Promise<string> {
  await router.push(url).catch(() => {})
  await router.isReady()
  return String(router.currentRoute.value.name)
}

async function main() {
  setActivePinia(createPinia())
  seedDatabase()
  const auth = useAuthStore()
  auth.logout()

  console.log('\n#7 - Guards: sin sesion')
  ok((await irA('/dashboard')) === 'login', '/dashboard redirige a /login')
  ok(
    router.currentRoute.value.query.redirect === '/dashboard',
    'conserva el destino en query.redirect',
  )
  ok((await irA('/properties')) === 'login', '/properties redirige a /login')
  ok((await irA('/contracts')) === 'login', '/contracts redirige a /login')
  ok((await irA('/transactions')) === 'login', '/transactions redirige a /login')
  ok((await irA('/map')) === 'login', '/map redirige a /login')
  ok((await irA('/reports')) === 'login', '/reports redirige a /login')
  ok((await irA('/admin/users')) === 'login', '/admin/users redirige a /login')
  ok((await irA('/')) === 'home', '/ sigue siendo publica')

  console.log('\n#7 - Guards: sesion de usuario normal')
  ok(auth.login('user@keyring.co', 'user123'), 'el usuario normal inicia sesion')
  ok(auth.isAuthenticated && !auth.isAdmin, 'isAuthenticated true, isAdmin false')
  ok((await irA('/dashboard')) === 'dashboard', 'accede a /dashboard')
  ok((await irA('/properties')) === 'properties', 'accede a /properties')
  ok((await irA('/reports')) === 'dashboard', '/reports lo devuelve a /dashboard')
  ok((await irA('/admin/users')) === 'dashboard', '/admin/users lo devuelve a /dashboard')
  ok((await irA('/login')) === 'dashboard', '/login redirige a /dashboard si ya hay sesion')

  console.log('\n#7 - Guards: sesion de administrador')
  auth.logout()
  ok(auth.login('admin@keyring.co', 'admin123'), 'el admin inicia sesion')
  ok(auth.isAdmin, 'isAdmin true')
  ok((await irA('/reports')) === 'reports', 'accede a /reports')
  ok((await irA('/admin/users')) === 'admin-users', 'accede a /admin/users')

  console.log('\n#7 - Guards: tras cerrar sesion')
  auth.logout()
  ok((await irA('/reports')) === 'login', '/reports vuelve a estar bloqueada')
  ok((await irA('/ruta-que-no-existe')) === 'not-found', 'una ruta inexistente cae en NotFound')

  console.log('\n' + (fallos === 0 ? 'TODO VERDE' : fallos + ' FALLAS'))
  if (fallos > 0) process.exitCode = 1
}

main()
