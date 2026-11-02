// --- External imports ---
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// --- Internal imports ---
import type { PropertyStatus } from '../../domain/enums/property-status.js';
import type { PropertyType } from '../../domain/enums/property-type.js';
import type { RentalMode } from '../../domain/enums/rental-mode.js';

// --- Exported members ---
export class CreatePropertyDto {
  @IsString() address: string;

  @IsInt() @Min(0) adminFee: number;

  @IsString() @IsNotEmpty() city: string;

  @IsInt() @Min(0) estimatedMonthlyRent: number;

  @IsOptional() @IsNumber() latitude?: number | null;

  @IsOptional() @IsNumber() longitude?: number | null;

  @IsString() @IsNotEmpty() name: string;

  @IsInt() @Min(0) otherFixedCosts: number;

  @IsIn(['AIRBNB', 'FIXED_CONTRACT', 'BOTH']) rentalMode: RentalMode;

  @IsIn(['ACTIVE', 'VACANT']) status: PropertyStatus;

  @IsIn(['HOUSE', 'APARTMENT', 'FARM']) type: PropertyType;

  @IsOptional() @IsString() userId?: string | null;
}
