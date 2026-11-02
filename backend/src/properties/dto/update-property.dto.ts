// --- External imports ---
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// --- Internal imports ---
import type { PropertyStatus } from '../../domain/enums/property-status.js';
import type { PropertyType } from '../../domain/enums/property-type.js';
import type { RentalMode } from '../../domain/enums/rental-mode.js';

// --- Exported members ---
export class UpdatePropertyDto {
  @IsOptional() @IsString() address?: string;

  @IsOptional() @IsInt() @Min(0) adminFee?: number;

  @IsOptional() @IsString() @IsNotEmpty() city?: string;

  @IsOptional() @IsInt() @Min(0) estimatedMonthlyRent?: number;

  @IsOptional() @IsNumber() latitude?: number | null;

  @IsOptional() @IsNumber() longitude?: number | null;

  @IsOptional() @IsString() @IsNotEmpty() name?: string;

  @IsOptional() @IsInt() @Min(0) otherFixedCosts?: number;

  @IsOptional() @IsIn(['AIRBNB', 'FIXED_CONTRACT', 'BOTH']) rentalMode?: RentalMode;

  @IsOptional() @IsIn(['ACTIVE', 'VACANT']) status?: PropertyStatus;

  @IsOptional() @IsIn(['HOUSE', 'APARTMENT', 'FARM']) type?: PropertyType;

  @IsOptional() @IsString() userId?: string | null;
}
