// --- Types ---
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// --- Exported members ---
export const UserRoleLabel: Record<UserRole, string> = Object.freeze({
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.USER]: 'Owner',
});
