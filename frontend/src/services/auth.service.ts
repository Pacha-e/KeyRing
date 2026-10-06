// Autenticación contra la API (Nest.js). La sesión se persiste en
// LocalStorage para sobrevivir recargas; las credenciales se validan en el
// servidor, que nunca devuelve la contraseña.
import { http } from './http'
import type { UserInterface } from '../interfaces/UserInterface'

const SESSION_KEY = 'keyring_session'

/** Usuario en sesión: mismo modelo sin el password (la API tampoco lo envía). */
export type SessionUser = Omit<UserInterface, 'password'>

/**
 * Valida credenciales contra la API y abre la sesión.
 * @param email correo registrado
 * @param password contraseña en texto plano (alcance del curso)
 * @returns el usuario sin contraseña, o null si no coinciden
 */
export async function login(email: string, password: string): Promise<SessionUser | null> {
  try {
    const { data } = await http.get<SessionUser | null>('/api/users/login', {
      params: { email, password },
    })
    if (!data) return null
    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    return data
  } catch {
    return null
  }
}

/** Cierra la sesión. */
export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}

/** Usuario con sesión abierta, o null si no la hay. */
export function currentUser(): SessionUser | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as SessionUser | null
  } catch {
    return null
  }
}
