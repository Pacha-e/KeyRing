// Capa de servicios de Property: aísla a las vistas del acceso directo a storage.ts.
import { getAll, getById, create, update, remove, KEYS } from './storage'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { CreatePropertyDTO } from '../dtos/CreatePropertyDTO'

export function getProperties(): PropertyInterface[] {
  return getAll<PropertyInterface>(KEYS.properties)
}

export function getPropertyById(id: string): PropertyInterface | null {
  return getById<PropertyInterface>(KEYS.properties, id)
}

export function createProperty(data: CreatePropertyDTO): PropertyInterface {
  return create<PropertyInterface>(KEYS.properties, data)
}

export function updateProperty(id: string, data: CreatePropertyDTO): PropertyInterface | null {
  return update<PropertyInterface>(KEYS.properties, id, data)
}

export function deleteProperty(id: string): void {
  remove(KEYS.properties, id)
}
