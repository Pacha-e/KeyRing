// --- Internal imports ---
import type { ContractStatus } from '../enums/ContractStatus';

// --- Types ---
export interface ContractInterface {
  endDate: string;
  fixedRent: number;
  id: string;
  propertyId: string;
  startDate: string;
  status: ContractStatus;
  tenantContact: string;
  tenantName: string;
}
