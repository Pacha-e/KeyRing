// --- External imports ---
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

// --- Internal imports ---
import { UserRole } from '../../domain/enums/user-role.js';

// --- Exported members ---
export class UpdateUserDto {
  @ValidateIf((_object, value: unknown) => value !== undefined) @IsString() city?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined) @IsEmail() email?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  memberSince?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  password?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined) @IsString() phone?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined) @IsEnum(UserRole) role?: UserRole;
}
