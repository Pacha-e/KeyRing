// Enumeraciones del dominio (diagrama de clases) + etiquetas en español para la UI

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum PropertyType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  FARM = 'FARM',
}

export enum RentalMode {
  AIRBNB = 'AIRBNB',
  FIXED_CONTRACT = 'FIXED_CONTRACT',
  BOTH = 'BOTH',
}

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  VACANT = 'VACANT',
}

export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionSource {
  AIRBNB = 'AIRBNB',
  CONTRACT = 'CONTRACT',
  OTHER = 'OTHER',
}

// Etiquetas en español para mostrar en la UI
export const PropertyTypeLabel: Record<PropertyType, string> = Object.freeze({
  [PropertyType.HOUSE]: 'Casa',
  [PropertyType.APARTMENT]: 'Apartamento',
  [PropertyType.FARM]: 'Finca',
})

export const RentalModeLabel: Record<RentalMode, string> = Object.freeze({
  [RentalMode.AIRBNB]: 'Airbnb',
  [RentalMode.FIXED_CONTRACT]: 'Contrato fijo',
  [RentalMode.BOTH]: 'Ambos',
})

export const PropertyStatusLabel: Record<PropertyStatus, string> = Object.freeze({
  [PropertyStatus.ACTIVE]: 'Activa',
  [PropertyStatus.VACANT]: 'Vacante',
})

export const ContractStatusLabel: Record<ContractStatus, string> = Object.freeze({
  [ContractStatus.ACTIVE]: 'Activo',
  [ContractStatus.EXPIRED]: 'Vencido',
  [ContractStatus.TERMINATED]: 'Terminado',
})

export const TransactionTypeLabel: Record<TransactionType, string> = Object.freeze({
  [TransactionType.INCOME]: 'Ingreso',
  [TransactionType.EXPENSE]: 'Gasto',
})

export const TransactionSourceLabel: Record<TransactionSource, string> = Object.freeze({
  [TransactionSource.AIRBNB]: 'Airbnb',
  [TransactionSource.CONTRACT]: 'Contrato',
  [TransactionSource.OTHER]: 'Otro',
})
