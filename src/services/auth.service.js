import { getAll, KEYS } from './storage'
import { UserRole } from '../models/enums'

const SESSION_KEY = 'keyring_session'

// Autenticación ficticia contra la colección de usuarios en LocalStorage.
// Retorna el usuario sin password, o null si las credenciales no coinciden.
export function login(email, password) {
  const user = getAll(KEYS.users).find((u) => u.email === email && u.password === password)
  if (!user) return null
  const sesion = { ...user }
  delete sesion.password
  localStorage.setItem(SESSION_KEY, JSON.stringify(sesion))
  return sesion
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export { UserRole }
