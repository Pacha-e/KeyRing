// --- External imports ---
import { compare, hash } from 'bcryptjs';

// --- Exported members ---
export class PasswordHasher {
  static hash(password: string): Promise<string> {
    return hash(password, 10);
  }

  static matches(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  }
}
