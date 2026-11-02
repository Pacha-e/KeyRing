// --- External imports ---
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// --- Internal imports ---
import { PropertyStatus } from '../../domain/enums/property-status.js';
import { PropertyType } from '../../domain/enums/property-type.js';
import { RentalMode } from '../../domain/enums/rental-mode.js';

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

  @IsOptional() @IsEnum(RentalMode) rentalMode?: RentalMode;

  @IsOptional() @IsEnum(PropertyStatus) status?: PropertyStatus;

  @IsOptional() @IsEnum(PropertyType) type?: PropertyType;

  @IsOptional() @IsString() userId?: string | null;
}
