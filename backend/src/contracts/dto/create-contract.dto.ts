import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import type { ContractStatus } from '../../domain/enums.js'

/** Datos para crear un contrato. */
export class CreateContractDto {
  @IsString() @IsNotEmpty() propertyId: string
  @IsInt() @Min(1) fixedRent: number
  @IsString() @IsNotEmpty() startDate: string
  @IsString() @IsNotEmpty() endDate: string
  @IsString() @IsNotEmpty() tenantName: string
  @IsString() @IsNotEmpty() tenantContact: string
  @IsIn(['ACTIVE', 'EXPIRED', 'TERMINATED']) status: ContractStatus
}

/** Campos modificables de un contrato; todos opcionales. */
export class UpdateContractDto {
  @IsOptional() @IsString() @IsNotEmpty() propertyId?: string
  @IsOptional() @IsInt() @Min(1) fixedRent?: number
  @IsOptional() @IsString() @IsNotEmpty() startDate?: string
  @IsOptional() @IsString() @IsNotEmpty() endDate?: string
  @IsOptional() @IsString() @IsNotEmpty() tenantName?: string
  @IsOptional() @IsString() @IsNotEmpty() tenantContact?: string
  @IsOptional() @IsIn(['ACTIVE', 'EXPIRED', 'TERMINATED']) status?: ContractStatus
}
