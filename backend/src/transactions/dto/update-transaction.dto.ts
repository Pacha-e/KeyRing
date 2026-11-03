// --- External imports ---
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';

// --- Internal imports ---
import { TransactionSource } from '../../domain/enums/transaction-source.js';
import { TransactionType } from '../../domain/enums/transaction-type.js';

// --- Exported members ---
export class UpdateTransactionDto {
  @ValidateIf((_object, value: unknown) => value !== undefined) @IsInt() @Min(1) amount?: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined) @IsString() description?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined) @IsUUID() propertyId?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(TransactionSource)
  source?: TransactionSource;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(TransactionType)
  type?: TransactionType;
}
