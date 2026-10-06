import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import type { PropertyStatus, PropertyType, RentalMode } from '../../domain/enums.js'

/** Datos para crear una propiedad. */
export class CreatePropertyDto {
  @IsString() @IsNotEmpty() name: string
  @IsString() address: string
  @IsString() @IsNotEmpty() city: string
  @IsIn(['HOUSE', 'APARTMENT', 'FARM']) type: PropertyType
  @IsIn(['AIRBNB', 'FIXED_CONTRACT', 'BOTH']) rentalMode: RentalMode
  @IsIn(['ACTIVE', 'VACANT']) status: PropertyStatus
  @IsInt() @Min(0) estimatedMonthlyRent: number
  @IsInt() @Min(0) adminFee: number
  @IsInt() @Min(0) otherFixedCosts: number
  @IsOptional() @IsString() ownerId?: string | null
  @IsOptional() @IsNumber() latitude?: number | null
  @IsOptional() @IsNumber() longitude?: number | null
}

/** Campos modificables de una propiedad; todos opcionales. */
export class UpdatePropertyDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string
  @IsOptional() @IsString() address?: string
  @IsOptional() @IsString() @IsNotEmpty() city?: string
  @IsOptional() @IsIn(['HOUSE', 'APARTMENT', 'FARM']) type?: PropertyType
  @IsOptional() @IsIn(['AIRBNB', 'FIXED_CONTRACT', 'BOTH']) rentalMode?: RentalMode
  @IsOptional() @IsIn(['ACTIVE', 'VACANT']) status?: PropertyStatus
  @IsOptional() @IsInt() @Min(0) estimatedMonthlyRent?: number
  @IsOptional() @IsInt() @Min(0) adminFee?: number
  @IsOptional() @IsInt() @Min(0) otherFixedCosts?: number
  @IsOptional() @IsString() ownerId?: string | null
  @IsOptional() @IsNumber() latitude?: number | null
  @IsOptional() @IsNumber() longitude?: number | null
}
