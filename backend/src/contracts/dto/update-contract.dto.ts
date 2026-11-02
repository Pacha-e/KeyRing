// --- External imports ---
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// --- Internal imports ---
import type { ContractStatus } from '../../domain/enums/contract-status.js';

// --- Exported members ---
export class UpdateContractDto {
  @IsOptional() @IsString() @IsNotEmpty() endDate?: string;

  @IsOptional() @IsInt() @Min(1) fixedRent?: number;

  @IsOptional() @IsString() @IsNotEmpty() propertyId?: string;

  @IsOptional() @IsString() @IsNotEmpty() startDate?: string;

  @IsOptional() @IsIn(['ACTIVE', 'EXPIRED', 'TERMINATED']) status?: ContractStatus;

  @IsOptional() @IsString() @IsNotEmpty() tenantContact?: string;

  @IsOptional() @IsString() @IsNotEmpty() tenantName?: string;
}
