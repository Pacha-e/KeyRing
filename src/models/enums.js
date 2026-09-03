// Constantes del dominio (diagrama de clases). Objetos congelados.

export const UserRole = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
})

export const PropertyType = Object.freeze({
  HOUSE: 'HOUSE',
  APARTMENT: 'APARTMENT',
  FARM: 'FARM',
})

export const RentalMode = Object.freeze({
  AIRBNB: 'AIRBNB',
  FIXED_CONTRACT: 'FIXED_CONTRACT',
  BOTH: 'BOTH',
})

export const PropertyStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  VACANT: 'VACANT',
})

export const ContractStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
})

export const TransactionType = Object.freeze({
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
})

export const TransactionSource = Object.freeze({
  AIRBNB: 'AIRBNB',
  CONTRACT: 'CONTRACT',
  OTHER: 'OTHER',
})

// Etiquetas en español para mostrar en la UI
export const PropertyTypeLabel = Object.freeze({
  HOUSE: 'Casa',
  APARTMENT: 'Apartamento',
  FARM: 'Finca',
})

export const RentalModeLabel = Object.freeze({
  AIRBNB: 'Airbnb',
  FIXED_CONTRACT: 'Contrato fijo',
  BOTH: 'Ambos',
})

export const PropertyStatusLabel = Object.freeze({
  ACTIVE: 'Activa',
  VACANT: 'Vacante',
})

export const ContractStatusLabel = Object.freeze({
  ACTIVE: 'Activo',
  EXPIRED: 'Vencido',
  TERMINATED: 'Terminado',
})

export const TransactionTypeLabel = Object.freeze({
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
})

export const TransactionSourceLabel = Object.freeze({
  AIRBNB: 'Airbnb',
  CONTRACT: 'Contrato',
  OTHER: 'Otro',
})
