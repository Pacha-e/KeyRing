// Servicio de contratos: habla con la API por HTTP (axios).
// Los contratos visibles son los de las propiedades visibles para la sesión;
// la API aplica esa regla cuando se le pasan los ids de las propiedades.
import { http } from './http'
import * as propertyService from './property.service'
import { ContractStatus } from '../interfaces/enums'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { CreateContractDTO } from '../dtos/CreateContractDTO'
import type { SessionUser } from './auth.service'

/**
 * Todos los contratos registrados (vista global del administrador).
 */
export async function list(): Promise<ContractInterface[]> {
  const { data } = await http.get<ContractInterface[]>('/api/contracts')
  return data
}

/**
 * Contratos de las propiedades visibles para la sesión actual.
 * @param user usuario en sesión, o null si no hay sesión
 */
export async function listForUser(user: SessionUser | null): Promise<ContractInterface[]> {
  const visibles = await propertyService.listForUser(user)
  if (visibles.length === 0) return []
  const { data } = await http.get<ContractInterface[]>('/api/contracts', {
    params: { propertyIds: visibles.map((p) => p.id).join(',') },
  })
  return data
}

/**
 * Busca un contrato por su id.
 * @param id identificador del contrato
 * @returns el contrato, o null si no existe (404 traducido a null)
 */
export async function findById(id: string): Promise<ContractInterface | null> {
  try {
    const { data } = await http.get<ContractInterface>(`/api/contracts/${id}`)
    return data
  } catch {
    return null
  }
}

/**
 * Registra un contrato nuevo.
 * @param newContract datos del contrato sin id
 * @returns el contrato creado, ya con su id
 */
export async function create(newContract: CreateContractDTO): Promise<ContractInterface> {
  const { data } = await http.post<ContractInterface>('/api/contracts', newContract)
  return data
}

/**
 * Modifica un contrato existente.
 * @param id identificador del contrato
 * @param changes campos a actualizar
 * @returns el contrato actualizado, o null si el id no existe
 */
export async function update(
  id: string,
  changes: Partial<CreateContractDTO>,
): Promise<ContractInterface | null> {
  try {
    const { data } = await http.patch<ContractInterface>(`/api/contracts/${id}`, changes)
    return data
  } catch {
    return null
  }
}

/**
 * Elimina un contrato.
 * @param id identificador del contrato
 */
export async function remove(id: string): Promise<void> {
  await http.delete(`/api/contracts/${id}`)
}

/**
 * Cuenta los contratos activos de un conjunto dado.
 * @param contracts contratos sobre los que calcular
 * @returns cantidad de contratos en estado ACTIVE
 */
export function countActive(contracts: ContractInterface[]): number {
  return contracts.filter((c) => c.status === ContractStatus.ACTIVE).length
}
