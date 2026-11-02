// --- External imports ---
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// --- Internal imports ---
import { TransactionSource } from '../../domain/enums/transaction-source.js';
import { TransactionType } from '../../domain/enums/transaction-type.js';

// --- Exported members ---
export class UpdateTransactionDto {
  @IsOptional() @IsInt() @Min(1) amount?: number;

  @IsOptional() @IsString() @IsNotEmpty() date?: string;

  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsString() @IsNotEmpty() propertyId?: string;

  @IsOptional() @IsEnum(TransactionSource) source?: TransactionSource;

  @IsOptional() @IsEnum(TransactionType) type?: TransactionType;
}
