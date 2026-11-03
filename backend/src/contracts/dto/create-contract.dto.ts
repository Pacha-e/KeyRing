// --- External imports ---
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

// --- Internal imports ---
import { ContractStatus } from '../../domain/enums/contract-status.js';

// --- Exported members ---
export class CreateContractDto {
  @IsDateString({ strict: true }) @Matches(/^\d{4}-\d{2}-\d{2}$/) endDate: string;

  @IsInt() @Min(1) fixedRent: number;

  @IsUUID() propertyId: string;

  @IsDateString({ strict: true }) @Matches(/^\d{4}-\d{2}-\d{2}$/) startDate: string;

  @IsEnum(ContractStatus) status: ContractStatus;

  @IsString() @IsNotEmpty() tenantContact: string;

  @IsString() @IsNotEmpty() tenantName: string;
}
