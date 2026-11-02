// --- Internal imports ---
import type { UserRole } from '../enums/UserRole';

// --- Types ---
export interface UserInterface {
  city: string;
  email: string;
  fullName: string;
  id: string;
  memberSince: string;
  password: string;
  phone: string;
  role: UserRole;
}
