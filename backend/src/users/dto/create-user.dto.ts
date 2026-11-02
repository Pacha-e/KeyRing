// --- External imports ---
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// --- Internal imports ---
import { UserRole } from '../../domain/enums/user-role.js';

// --- Exported members ---
export class CreateUserDto {
  @IsString()
  city: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  memberSince?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;
}
