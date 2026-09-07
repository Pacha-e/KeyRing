// Servicio de propiedades. Única puerta de entrada a los datos de Property:
// las vistas y componentes nunca hablan con storage.ts directamente.
import { getAll, getById, create as insert, update as patch, remove as del, KEYS } from './storage'
import { UserRole } from '../interfaces/enums'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { CreatePropertyDTO } from '../dtos/CreatePropertyDTO'
import type { SessionUser } from './auth.service'

/**
 * Todas las propiedades registradas.
 * @returns lista completa, sin filtrar por dueño
 */
export function list(): PropertyInterface[] {
  return getAll<PropertyInterface>(KEYS.properties)
}

/**
 * Propiedades visibles para la sesión actual.
 * El administrador ve todas; el propietario solo las suyas.
 * @param user usuario en sesión, o null si no hay sesión
 * @returns propiedades que el usuario puede consultar
 */
export function listForUser(user: SessionUser | null): PropertyInterface[] {
  if (!user) return []
  const todas = list()
  return user.role === UserRole.ADMIN ? todas : todas.filter((p) => p.ownerId === user.id)
}

/**
 * Busca una propiedad por su id.
 * @param id identificador de la propiedad
 * @returns la propiedad, o null si no existe
 */
export function findById(id: string): PropertyInterface | null {
  return getById<PropertyInterface>(KEYS.properties, id)
}

/**
 * Registra una propiedad nueva.
 * @param dto datos de la propiedad sin id
 * @returns la propiedad creada, ya con su id
 */
export function create(dto: CreatePropertyDTO): PropertyInterface {
  return insert<PropertyInterface>(KEYS.properties, dto)
}

/**
 * Modifica una propiedad existente.
 * @param id identificador de la propiedad
 * @param cambios campos a actualizar
 * @returns la propiedad actualizada, o null si el id no existe
 */
export function update(id: string, cambios: Partial<CreatePropertyDTO>): PropertyInterface | null {
  return patch<PropertyInterface>(KEYS.properties, id, cambios)
}

/**
 * Elimina una propiedad.
 * @param id identificador de la propiedad
 */
export function remove(id: string): void {
  del(KEYS.properties, id)
}

/**
 * Ciudades distintas presentes en un conjunto de propiedades.
 * @param properties propiedades sobre las que calcular
 * @returns ciudades ordenadas alfabéticamente, para alimentar los selectores
 */
export function cities(properties: PropertyInterface[]): string[] {
  return [...new Set(properties.map((p) => p.city))].sort()
}

/**
 * Cuenta las propiedades agrupadas por tipo.
 * @param properties propiedades sobre las que calcular
 * @returns mapa tipo -> cantidad, para los gráficos
 */
export function countByType(properties: PropertyInterface[]): Record<string, number> {
  return properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1
    return acc
  }, {})
}
