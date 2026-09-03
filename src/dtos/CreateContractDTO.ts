import type { ContractInterface } from '../interfaces/ContractInterface'

/** Datos para crear un contrato (el id lo genera el repositorio) */
export type CreateContractDTO = Omit<ContractInterface, 'id'>
