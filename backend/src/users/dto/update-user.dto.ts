// --- External imports ---
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// --- Internal imports ---
import type { UserRole } from '../../domain/enums/user-role.js';

// --- Exported members ---
export class UpdateUserDto {
  @IsOptional() @IsString() city?: string;

  @IsOptional() @IsEmail() email?: string;

  @IsOptional() @IsString() @IsNotEmpty() fullName?: string;

  @IsOptional() @IsString() memberSince?: string;

  @IsOptional() @IsString() password?: string;

  @IsOptional() @IsString() phone?: string;

  @IsOptional() @IsIn(['admin', 'user']) role?: UserRole;
}
