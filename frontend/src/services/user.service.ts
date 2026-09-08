// Servicio de usuarios (gestión exclusiva de administradores).
// Incluye las guardas de integridad: el sistema nunca puede quedarse sin admin.
import * as storage from './storage'
import { UserRole } from '../interfaces/enums'
import type { UserInterface } from '../interfaces/UserInterface'
import type { CreateUserDTO } from '../dtos/CreateUserDTO'

/**
 * Todos los usuarios registrados.
 * @returns lista completa de usuarios
 */
export function list(): UserInterface[] {
  return storage.findAll<UserInterface>(storage.STORAGE_KEYS.users)
}

/**
 * Busca un usuario por su id.
 * @param id identificador del usuario
 * @returns el usuario, o null si no existe
 */
export function findById(id: string): UserInterface | null {
  return storage.findById<UserInterface>(storage.STORAGE_KEYS.users, id)
}

/**
 * Indica si un correo ya está registrado por otro usuario.
 * @param email correo a verificar
 * @param exceptId id a excluir de la comparación (al editar el propio usuario)
 * @returns true si el correo ya está en uso
 */
export function emailTaken(email: string, exceptId?: string): boolean {
  const normalizedEmail = email.trim().toLowerCase()
  return list().some((user) => user.id !== exceptId && user.email.toLowerCase() === normalizedEmail)
}

/**
 * Registra un usuario nuevo.
 * @param newUser datos del usuario sin id
 * @returns el usuario creado, ya con su id
 */
export function create(newUser: CreateUserDTO): UserInterface {
  return storage.insert<UserInterface>(storage.STORAGE_KEYS.users, newUser)
}

/**
 * Modifica un usuario existente.
 * @param id identificador del usuario
 * @param changes campos a actualizar
 * @returns el usuario actualizado, o null si el id no existe
 */
export function update(id: string, changes: Partial<CreateUserDTO>): UserInterface | null {
  return storage.applyChanges<UserInterface>(storage.STORAGE_KEYS.users, id, changes)
}

/**
 * Cuenta los administradores registrados.
 * @returns cantidad de usuarios con rol de administrador
 */
export function countAdmins(): number {
  return list().filter((user) => user.role === UserRole.ADMIN).length
}

/**
 * Verifica si un usuario puede eliminarse sin dejar el sistema inconsistente.
 * @param id identificador del usuario a eliminar
 * @param currentUserId id del usuario en sesión
 * @returns null si se puede eliminar, o el motivo del bloqueo en español
 */
export function blockedFromRemoval(id: string, currentUserId: string): string | null {
  if (id === currentUserId) return 'No puedes eliminar tu propio usuario.'
  const user = findById(id)
  if (!user) return 'El usuario ya no existe.'
  if (user.role === UserRole.ADMIN && countAdmins() <= 1) {
    return 'No puedes eliminar al último administrador del sistema.'
  }
  return null
}

/**
 * Elimina un usuario.
 * @param id identificador del usuario
 */
export function remove(id: string): void {
  storage.deleteById(storage.STORAGE_KEYS.users, id)
}
