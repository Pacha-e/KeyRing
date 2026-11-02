// --- External imports ---
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// --- Internal imports ---
import type { TransactionSource } from '../../domain/enums/transaction-source.js';
import type { TransactionType } from '../../domain/enums/transaction-type.js';

// --- Exported members ---
export class UpdateTransactionDto {
  @IsOptional() @IsInt() @Min(1) amount?: number;

  @IsOptional() @IsString() @IsNotEmpty() date?: string;

  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsString() @IsNotEmpty() propertyId?: string;

  @IsOptional() @IsIn(['AIRBNB', 'CONTRACT', 'OTHER']) source?: TransactionSource;

  @IsOptional() @IsIn(['INCOME', 'EXPENSE']) type?: TransactionType;
}
