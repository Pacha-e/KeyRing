// Servicio de contratos. Los contratos se filtran por las propiedades
// visibles para la sesión: un propietario solo ve los de sus inmuebles.
import * as storage from './storage'
import * as propertyService from './property.service'
import { ContractStatus } from '../interfaces/enums'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { CreateContractDTO } from '../dtos/CreateContractDTO'
import type { SessionUser } from './auth.service'

/**
 * Todos los contratos registrados.
 * @returns lista completa, sin filtrar por dueño
 */
export function list(): ContractInterface[] {
  return storage.findAll<ContractInterface>(storage.STORAGE_KEYS.contracts)
}

/**
 * Contratos de las propiedades visibles para la sesión actual.
 * @param user usuario en sesión, o null si no hay sesión
 * @returns contratos que el usuario puede consultar
 */
export function listForUser(user: SessionUser | null): ContractInterface[] {
  const visibles = new Set(propertyService.listForUser(user).map((p) => p.id))
  return list().filter((c) => visibles.has(c.propertyId))
}

/**
 * Contratos asociados a una propiedad.
 * @param propertyId identificador de la propiedad
 * @returns contratos de esa propiedad
 */
export function listByProperty(propertyId: string): ContractInterface[] {
  return list().filter((c) => c.propertyId === propertyId)
}

/**
 * Busca un contrato por su id.
 * @param id identificador del contrato
 * @returns el contrato, o null si no existe
 */
export function findById(id: string): ContractInterface | null {
  return storage.findById<ContractInterface>(storage.STORAGE_KEYS.contracts, id)
}

/**
 * Registra un contrato nuevo.
 * @param dto datos del contrato sin id
 * @returns el contrato creado, ya con su id
 */
export function create(dto: CreateContractDTO): ContractInterface {
  return storage.insert<ContractInterface>(storage.STORAGE_KEYS.contracts, dto)
}

/**
 * Modifica un contrato existente.
 * @param id identificador del contrato
 * @param changes campos a actualizar
 * @returns el contrato actualizado, o null si el id no existe
 */
export function update(id: string, changes: Partial<CreateContractDTO>): ContractInterface | null {
  return storage.applyChanges<ContractInterface>(storage.STORAGE_KEYS.contracts, id, changes)
}

/**
 * Elimina un contrato.
 * @param id identificador del contrato
 */
export function remove(id: string): void {
  storage.deleteById(storage.STORAGE_KEYS.contracts, id)
}

/**
 * Cuenta los contratos activos de un conjunto dado.
 * @param contracts contratos sobre los que calcular
 * @returns cantidad de contratos en estado ACTIVE
 */
export function countActive(contracts: ContractInterface[]): number {
  return contracts.filter((c) => c.status === ContractStatus.ACTIVE).length
}
