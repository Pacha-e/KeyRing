// --- External imports ---
import { IsDateString, IsEnum, IsInt, IsString, IsUUID, Matches, Min } from 'class-validator';

// --- Internal imports ---
import { TransactionSource } from '../../domain/enums/transaction-source.js';
import { TransactionType } from '../../domain/enums/transaction-type.js';

// --- Exported members ---
export class CreateTransactionDto {
  @IsInt() @Min(1) amount: number;

  @IsDateString({ strict: true }) @Matches(/^\d{4}-\d{2}-\d{2}$/) date: string;

  @IsString() description: string;

  @IsUUID() propertyId: string;

  @IsEnum(TransactionSource) source: TransactionSource;

  @IsEnum(TransactionType) type: TransactionType;
}
