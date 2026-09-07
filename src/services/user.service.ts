// Servicio de usuarios (gestión exclusiva de administradores).
// Incluye las guardas de integridad: el sistema nunca puede quedarse sin admin.
import { getAll, getById, create as insert, update as patch, remove as del, KEYS } from './storage'
import { UserRole } from '../interfaces/enums'
import type { UserInterface } from '../interfaces/UserInterface'

/** Datos para crear un usuario (el id lo genera el repositorio). */
export type CreateUserDTO = Omit<UserInterface, 'id'>

/**
 * Todos los usuarios registrados.
 * @returns lista completa de usuarios
 */
export function list(): UserInterface[] {
  return getAll<UserInterface>(KEYS.users)
}

/**
 * Busca un usuario por su id.
 * @param id identificador del usuario
 * @returns el usuario, o null si no existe
 */
export function findById(id: string): UserInterface | null {
  return getById<UserInterface>(KEYS.users, id)
}

/**
 * Indica si un correo ya está registrado por otro usuario.
 * @param email correo a verificar
 * @param exceptId id a excluir de la comparación (al editar el propio usuario)
 * @returns true si el correo ya está en uso
 */
export function emailTaken(email: string, exceptId?: string): boolean {
  const normalizado = email.trim().toLowerCase()
  return list().some((u) => u.id !== exceptId && u.email.toLowerCase() === normalizado)
}

/**
 * Registra un usuario nuevo.
 * @param dto datos del usuario sin id
 * @returns el usuario creado, ya con su id
 */
export function create(dto: CreateUserDTO): UserInterface {
  return insert<UserInterface>(KEYS.users, dto)
}

/**
 * Modifica un usuario existente.
 * @param id identificador del usuario
 * @param cambios campos a actualizar
 * @returns el usuario actualizado, o null si el id no existe
 */
export function update(id: string, cambios: Partial<CreateUserDTO>): UserInterface | null {
  return patch<UserInterface>(KEYS.users, id, cambios)
}

/**
 * Cuenta los administradores registrados.
 * @returns cantidad de usuarios con rol de administrador
 */
export function countAdmins(): number {
  return list().filter((u) => u.role === UserRole.ADMIN).length
}

/**
 * Verifica si un usuario puede eliminarse sin dejar el sistema inconsistente.
 * @param id identificador del usuario a eliminar
 * @param currentUserId id del usuario en sesión
 * @returns null si se puede eliminar, o el motivo del bloqueo en español
 */
export function blockedFromRemoval(id: string, currentUserId: string): string | null {
  if (id === currentUserId) return 'No puedes eliminar tu propio usuario.'
  const usuario = findById(id)
  if (!usuario) return 'El usuario ya no existe.'
  if (usuario.role === UserRole.ADMIN && countAdmins() <= 1) {
    return 'No puedes eliminar al último administrador del sistema.'
  }
  return null
}

/**
 * Elimina un usuario.
 * @param id identificador del usuario
 */
export function remove(id: string): void {
  del(KEYS.users, id)
}
