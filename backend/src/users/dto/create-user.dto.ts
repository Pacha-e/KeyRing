// --- External imports ---
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

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
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  memberSince?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;
}
