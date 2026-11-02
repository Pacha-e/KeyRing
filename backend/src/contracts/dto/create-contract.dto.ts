// --- External imports ---
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

// --- Internal imports ---
import { ContractStatus } from '../../domain/enums/contract-status.js';

// --- Exported members ---
export class CreateContractDto {
  @IsString() @IsNotEmpty() endDate: string;

  @IsInt() @Min(1) fixedRent: number;

  @IsString() @IsNotEmpty() propertyId: string;

  @IsString() @IsNotEmpty() startDate: string;

  @IsEnum(ContractStatus) status: ContractStatus;

  @IsString() @IsNotEmpty() tenantContact: string;

  @IsString() @IsNotEmpty() tenantName: string;
}
