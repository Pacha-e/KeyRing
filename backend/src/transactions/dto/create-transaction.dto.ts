import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import type { TransactionSource, TransactionType } from '../../domain/enums.js'

/** Datos para crear una transacción. */
export class CreateTransactionDto {
  @IsString() @IsNotEmpty() propertyId: string
  @IsIn(['INCOME', 'EXPENSE']) type: TransactionType
  @IsIn(['AIRBNB', 'CONTRACT', 'OTHER']) source: TransactionSource
  @IsInt() @Min(1) amount: number
  @IsString() @IsNotEmpty() date: string
  @IsString() description: string
}

/** Campos modificables de una transacción; todos opcionales. */
export class UpdateTransactionDto {
  @IsOptional() @IsString() @IsNotEmpty() propertyId?: string
  @IsOptional() @IsIn(['INCOME', 'EXPENSE']) type?: TransactionType
  @IsOptional() @IsIn(['AIRBNB', 'CONTRACT', 'OTHER']) source?: TransactionSource
  @IsOptional() @IsInt() @Min(1) amount?: number
  @IsOptional() @IsString() @IsNotEmpty() date?: string
  @IsOptional() @IsString() description?: string
}
