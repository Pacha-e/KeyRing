// --- Internal imports ---
import type { UserInterface } from '../interfaces/UserInterface';

// --- Types ---
export type CreateUserDto = Omit<UserInterface, 'id'>;
