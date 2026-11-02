// --- Internal imports ---
import type { ContractInterface } from '../interfaces/ContractInterface';

// --- Types ---
export type CreateContractDto = Omit<ContractInterface, 'id'>;
