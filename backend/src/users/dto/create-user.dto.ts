import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import type { UserRole } from '../../domain/enums.js'

/** Datos para crear un usuario. memberSince lo fija el servidor si no viene. */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string

  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  phone: string

  @IsString()
  city: string

  @IsOptional()
  @IsString()
  memberSince?: string

  @IsIn(['admin', 'user'])
  role: UserRole
}

/** Campos modificables de un usuario existente; todos opcionales. */
export class UpdateUserDto {
  @IsOptional() @IsString() @IsNotEmpty() fullName?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsString() password?: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsString() city?: string
  @IsOptional() @IsString() memberSince?: string
  @IsOptional() @IsIn(['admin', 'user']) role?: UserRole
}
