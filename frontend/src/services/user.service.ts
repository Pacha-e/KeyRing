// Servicio de usuarios (gestión exclusiva de administradores).
// Habla con la API por HTTP; las guardas de integridad (nunca quedarse sin
// admin, no auto-eliminarse) viven en el backend y también aquí para la UI.
import { http } from './http'
import type { SessionUser } from './auth.service'

/**
 * Todos los usuarios registrados. La API nunca incluye contraseñas.
 */
export async function list(): Promise<SessionUser[]> {
  const { data } = await http.get<SessionUser[]>('/api/users')
  return data
}

/**
 * Busca un usuario por su id.
 * @param id identificador del usuario
 * @returns el usuario sin contraseña, o null si no existe
 */
export async function findById(id: string): Promise<SessionUser | null> {
  try {
    const { data } = await http.get<SessionUser>(`/api/users/${id}`)
    return data
  } catch {
    return null
  }
}

/**
 * Indica si un correo ya está registrado por otro usuario.
 * @param email correo a verificar
 * @param exceptId id a excluir de la comparación (al editar el propio usuario)
 */
export async function emailTaken(email: string, exceptId?: string): Promise<boolean> {
  const { data } = await http.get<{ taken: boolean }>('/api/users/email-taken', {
    params: { email, exceptId },
  })
  return data.taken
}

/**
 * Registra un usuario nuevo.
 * @param newUser datos del usuario sin id
 * @returns el usuario creado, ya con su id y sin contraseña
 */
export async function create(newUser: Omit<SessionUser, 'id'> & { password: string }): Promise<SessionUser> {
  const { data } = await http.post<SessionUser>('/api/users', newUser)
  return data
}

/**
 * Modifica un usuario existente.
 * @param id identificador del usuario
 * @param changes campos a actualizar
 * @returns el usuario actualizado, o null si el id no existe
 */
export async function update(
  id: string,
  changes: Partial<Omit<SessionUser, 'id'>> & { password?: string },
): Promise<SessionUser | null> {
  try {
    const { data } = await http.patch<SessionUser>(`/api/users/${id}`, changes)
    return data
  } catch {
    return null
  }
}

/**
 * Verifica si un usuario puede eliminarse sin dejar el sistema inconsistente.
 * @param id identificador del usuario a eliminar
 * @param currentUserId id del usuario en sesión
 * @returns null si se puede eliminar, o el motivo del bloqueo en español
 */
export async function blockedFromRemoval(
  id: string,
  currentUserId: string,
): Promise<string | null> {
  if (id === currentUserId) return 'No puedes eliminar tu propio usuario.'
  const user = await findById(id)
  if (!user) return 'El usuario ya no existe.'
  const users = await list()
  const admins = users.filter((candidate) => candidate.role === 'admin').length
  if (user.role === 'admin' && admins <= 1) {
    return 'No puedes eliminar al último administrador del sistema.'
  }
  return null
}

/**
 * Elimina un usuario.
 * @param id identificador del usuario
 */
export async function remove(id: string): Promise<void> {
  await http.delete(`/api/users/${id}`)
}
