// --- External imports ---
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

// --- Internal imports ---
import { PropertyStatus } from '../../domain/enums/property-status.js';
import { PropertyType } from '../../domain/enums/property-type.js';
import { RentalMode } from '../../domain/enums/rental-mode.js';

// --- Exported members ---
export class UpdatePropertyDto {
  @ValidateIf((_object, value: unknown) => value !== undefined) @IsString() address?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined) @IsInt() @Min(0) adminFee?: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  estimatedMonthlyRent?: number;

  @IsOptional() @IsNumber() latitude?: number | null;

  @IsOptional() @IsNumber() longitude?: number | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  otherFixedCosts?: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(RentalMode)
  rentalMode?: RentalMode;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional() @IsUUID() userId?: string | null;
}
