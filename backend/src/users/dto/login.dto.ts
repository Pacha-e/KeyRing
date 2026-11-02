// --- External imports ---
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// --- Exported members ---
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
