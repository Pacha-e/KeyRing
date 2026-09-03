import type { ContractStatus } from './enums'

export interface ContractInterface {
  id: string
  propertyId: string
  fixedRent: number
  startDate: string
  endDate: string
  tenantName: string
  tenantContact: string
  status: ContractStatus
}
