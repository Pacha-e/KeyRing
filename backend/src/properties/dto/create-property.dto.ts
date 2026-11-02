// --- External imports ---
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// --- Internal imports ---
import { PropertyStatus } from '../../domain/enums/property-status.js';
import { PropertyType } from '../../domain/enums/property-type.js';
import { RentalMode } from '../../domain/enums/rental-mode.js';

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

  @IsEnum(RentalMode) rentalMode: RentalMode;

  @IsEnum(PropertyStatus) status: PropertyStatus;

  @IsEnum(PropertyType) type: PropertyType;

  @IsOptional() @IsString() userId?: string | null;
}
