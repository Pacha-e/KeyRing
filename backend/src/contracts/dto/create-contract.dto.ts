// --- External imports ---
import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

// --- Internal imports ---
import type { ContractStatus } from '../../domain/enums/contract-status.js';

// --- Exported members ---
export class CreateContractDto {
  @IsString() @IsNotEmpty() endDate: string;

  @IsInt() @Min(1) fixedRent: number;

  @IsString() @IsNotEmpty() propertyId: string;

  @IsString() @IsNotEmpty() startDate: string;

  @IsIn(['ACTIVE', 'EXPIRED', 'TERMINATED']) status: ContractStatus;

  @IsString() @IsNotEmpty() tenantContact: string;

  @IsString() @IsNotEmpty() tenantName: string;
}
