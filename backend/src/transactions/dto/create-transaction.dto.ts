// --- External imports ---
import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

// --- Internal imports ---
import type { TransactionSource } from '../../domain/enums/transaction-source.js';
import type { TransactionType } from '../../domain/enums/transaction-type.js';

// --- Exported members ---
export class CreateTransactionDto {
  @IsInt() @Min(1) amount: number;

  @IsString() @IsNotEmpty() date: string;

  @IsString() description: string;

  @IsString() @IsNotEmpty() propertyId: string;

  @IsIn(['AIRBNB', 'CONTRACT', 'OTHER']) source: TransactionSource;

  @IsIn(['INCOME', 'EXPENSE']) type: TransactionType;
}
