// Valores del dominio compartidos con el frontend. Se definen como uniones de
// literales porque en la base de datos viajan como texto plano.
export type UserRole = 'admin' | 'user'
export type PropertyType = 'HOUSE' | 'APARTMENT' | 'FARM'
export type RentalMode = 'AIRBNB' | 'FIXED_CONTRACT' | 'BOTH'
export type PropertyStatus = 'ACTIVE' | 'VACANT'
export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionSource = 'AIRBNB' | 'CONTRACT' | 'OTHER'
