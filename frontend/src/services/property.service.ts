// Servicio de propiedades: única puerta de entrada a los datos de Property.
// Habla con la API por HTTP (axios); las vistas nunca conocen el transporte,
// así que cambiar la dirección de la API solo toca la configuración.
import { http } from './http'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { CreatePropertyDTO } from '../dtos/CreatePropertyDTO'
import type { SessionUser } from './auth.service'

/**
 * Todas las propiedades registradas (vista global del administrador).
 */
export async function list(): Promise<PropertyInterface[]> {
  const { data } = await http.get<PropertyInterface[]>('/api/properties')
  return data
}

/**
 * Propiedades visibles para la sesión actual.
 * El administrador ve todas; el propietario solo las suyas. La regla vive en
 * la API, que filtra por rol y dueño.
 * @param user usuario en sesión, o null si no hay sesión
 */
export async function listForUser(user: SessionUser | null): Promise<PropertyInterface[]> {
  if (!user) return []
  const { data } = await http.get<PropertyInterface[]>('/api/properties', {
    params: { role: user.role, userId: user.id },
  })
  return data
}

/**
 * Busca una propiedad por su id.
 * @param id identificador de la propiedad
 * @returns la propiedad, o null si no existe (404 traducido a null)
 */
export async function findById(id: string): Promise<PropertyInterface | null> {
  try {
    const { data } = await http.get<PropertyInterface>(`/api/properties/${id}`)
    return data
  } catch {
    return null
  }
}

/**
 * Registra una propiedad nueva.
 * @param newProperty datos de la propiedad sin id
 * @returns la propiedad creada, ya con su id
 */
export async function create(newProperty: CreatePropertyDTO): Promise<PropertyInterface> {
  const { data } = await http.post<PropertyInterface>('/api/properties', newProperty)
  return data
}

/**
 * Modifica una propiedad existente.
 * @param id identificador de la propiedad
 * @param changes campos a actualizar
 * @returns la propiedad actualizada, o null si el id no existe
 */
export async function update(
  id: string,
  changes: Partial<CreatePropertyDTO>,
): Promise<PropertyInterface | null> {
  try {
    const { data } = await http.patch<PropertyInterface>(`/api/properties/${id}`, changes)
    return data
  } catch {
    return null
  }
}

/**
 * Elimina una propiedad.
 * @param id identificador de la propiedad
 */
export async function remove(id: string): Promise<void> {
  await http.delete(`/api/properties/${id}`)
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
