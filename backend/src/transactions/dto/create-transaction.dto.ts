// --- External imports ---
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

// --- Internal imports ---
import { TransactionSource } from '../../domain/enums/transaction-source.js';
import { TransactionType } from '../../domain/enums/transaction-type.js';

// --- Exported members ---
export class CreateTransactionDto {
  @IsInt() @Min(1) amount: number;

  @IsString() @IsNotEmpty() date: string;

  @IsString() description: string;

  @IsString() @IsNotEmpty() propertyId: string;

  @IsEnum(TransactionSource) source: TransactionSource;

  @IsEnum(TransactionType) type: TransactionType;
}
