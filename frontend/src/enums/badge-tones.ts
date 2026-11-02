// --- Internal imports ---
import { ContractStatus } from './ContractStatus';
import { PropertyStatus } from './PropertyStatus';
import { RentalMode } from './RentalMode';
import { TransactionSource } from './TransactionSource';
import { TransactionType } from './TransactionType';
import { UserRole } from './UserRole';

// --- Constants ---
export const CONTRACT_STATUS_TONE: Record<ContractStatus, BadgeTone> = Object.freeze({
  [ContractStatus.ACTIVE]: 'green',
  [ContractStatus.EXPIRED]: 'red',
  [ContractStatus.TERMINATED]: 'gray',
});

export const PROPERTY_STATUS_TONE: Record<PropertyStatus, BadgeTone> = Object.freeze({
  [PropertyStatus.ACTIVE]: 'green',
  [PropertyStatus.VACANT]: 'gray',
});

export const RENTAL_MODE_TONE: Record<RentalMode, BadgeTone> = Object.freeze({
  [RentalMode.AIRBNB]: 'primary',
  [RentalMode.FIXED_CONTRACT]: 'blue',
  [RentalMode.BOTH]: 'dark',
});

export const TRANSACTION_SOURCE_TONE: Record<TransactionSource, BadgeTone> = Object.freeze({
  [TransactionSource.AIRBNB]: 'primary',
  [TransactionSource.CONTRACT]: 'blue',
  [TransactionSource.OTHER]: 'gray',
});

export const TRANSACTION_TYPE_TONE: Record<TransactionType, BadgeTone> = Object.freeze({
  [TransactionType.INCOME]: 'green',
  [TransactionType.EXPENSE]: 'red',
});

export const USER_ROLE_TONE: Record<UserRole, BadgeTone> = Object.freeze({
  [UserRole.ADMIN]: 'dark',
  [UserRole.USER]: 'gray',
});

// --- Types ---
export type BadgeTone = 'green' | 'gray' | 'dark' | 'blue' | 'red' | 'purple' | 'primary';
