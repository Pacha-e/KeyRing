// Ejercita los guards reales de src/router/index.ts navegando por URL directa.
// La sesión se inyecta directo en la store: el login de auth.service es asíncrono
// contra la API, y para probar los guards basta el estado (user/no-user, admin/user).
import { setActivePinia, createPinia } from 'pinia'
import router from '../src/router'
import { useAuthStore } from '../src/stores/auth'
import type { SessionUser } from '../src/services/auth.service'
import { UserRole } from '../src/interfaces/enums'

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

/** Usuario de prueba, igual al que devuelve la API al hacer login. */
const ADMIN: SessionUser = {
  id: '00000000-0000-4000-8000-000000000001',
  fullName: 'Admin KeyRing',
  email: 'admin@keyring.co',
  phone: '3001112233',
  city: 'Medellin',
  memberSince: '2026-01-01',
  role: UserRole.ADMIN,
}
const USUARIO: SessionUser = {
  id: '00000000-0000-4000-8000-000000000002',
  fullName: 'Usuario Demo',
  email: 'user@keyring.co',
  phone: '3002223344',
  city: 'Cali',
  memberSince: '2026-01-01',
  role: UserRole.USER,
}

async function main() {
  setActivePinia(createPinia())
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
  auth.user = USUARIO
  ok(auth.isAuthenticated && !auth.isAdmin, 'isAuthenticated true, isAdmin false')
  ok((await irA('/dashboard')) === 'dashboard', 'accede a /dashboard')
  ok((await irA('/properties')) === 'properties', 'accede a /properties')
  ok((await irA('/reports')) === 'dashboard', '/reports lo devuelve a /dashboard')
  ok((await irA('/admin/users')) === 'dashboard', '/admin/users lo devuelve a /dashboard')
  ok((await irA('/login')) === 'dashboard', '/login redirige a /dashboard si ya hay sesion')

  console.log('\n#7 - Guards: sesion de administrador')
  auth.user = ADMIN
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
