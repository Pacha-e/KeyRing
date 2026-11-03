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
  ValidateIf,
} from 'class-validator';

// --- Internal imports ---
import { ContractStatus } from '../../domain/enums/contract-status.js';

// --- Exported members ---
export class UpdateContractDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined) @IsInt() @Min(1) fixedRent?: number;

  @ValidateIf((_object, value: unknown) => value !== undefined) @IsUUID() propertyId?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  tenantContact?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  tenantName?: string;
}
