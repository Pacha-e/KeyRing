import { getAll, KEYS } from './storage'
import type { UserInterface } from '../interfaces/UserInterface'

const SESSION_KEY = 'keyring_session'

/** Usuario en sesión: mismo modelo sin el password */
export type SessionUser = Omit<UserInterface, 'password'>

// Autenticación ficticia contra la colección de usuarios en LocalStorage.
// Retorna el usuario sin password, o null si las credenciales no coinciden.
export function login(email: string, password: string): SessionUser | null {
  const user = getAll<UserInterface>(KEYS.users).find(
    (u) => u.email === email && u.password === password,
  )
  if (!user) return null
  const sesion: Partial<UserInterface> = { ...user }
  delete sesion.password
  localStorage.setItem(SESSION_KEY, JSON.stringify(sesion))
  return sesion as SessionUser
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function currentUser(): SessionUser | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as SessionUser | null
  } catch {
    return null
  }
}
