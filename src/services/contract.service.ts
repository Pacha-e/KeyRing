// Capa de servicios de Contract: aísla a las vistas del acceso directo a storage.ts.
import { getAll, create, update, remove, KEYS } from './storage'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { CreateContractDTO } from '../dtos/CreateContractDTO'

export function getContracts(): ContractInterface[] {
  return getAll<ContractInterface>(KEYS.contracts)
}

export function createContract(data: CreateContractDTO): ContractInterface {
  return create<ContractInterface>(KEYS.contracts, data)
}

export function updateContract(id: string, data: CreateContractDTO): ContractInterface | null {
  return update<ContractInterface>(KEYS.contracts, id, data)
}

export function deleteContract(id: string): void {
  remove(KEYS.contracts, id)
}
