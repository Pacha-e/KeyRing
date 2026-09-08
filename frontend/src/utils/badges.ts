// Color de cada valor de estado del dominio.
//
// El color comunica algo concreto: verde es "está produciendo", gris es "no está
// produciendo", rojo es "salió dinero". Esa correspondencia se decide una sola
// vez aquí para que un contrato vencido no aparezca rojo en una pantalla y gris
// en otra, y para que añadir un estado nuevo al dominio obligue a decidir su
// color en un único archivo.
import {
  ContractStatus,
  PropertyStatus,
  RentalMode,
  TransactionSource,
  TransactionType,
  UserRole,
} from '../interfaces/enums'
import type { BadgeTone } from '../components/StatusBadge.vue'

/** Activa = generando renta. Vacante = sin producir. */
export const PROPERTY_STATUS_TONE: Record<PropertyStatus, BadgeTone> = Object.freeze({
  [PropertyStatus.ACTIVE]: 'green',
  [PropertyStatus.VACANT]: 'gray',
})

/** Vencido se marca en rojo porque exige una acción del propietario. */
export const CONTRACT_STATUS_TONE: Record<ContractStatus, BadgeTone> = Object.freeze({
  [ContractStatus.ACTIVE]: 'green',
  [ContractStatus.EXPIRED]: 'red',
  [ContractStatus.TERMINATED]: 'gray',
})

/** Entra dinero en verde, sale en rojo: es la lectura inmediata de la tabla. */
export const TRANSACTION_TYPE_TONE: Record<TransactionType, BadgeTone> = Object.freeze({
  [TransactionType.INCOME]: 'green',
  [TransactionType.EXPENSE]: 'red',
})

/**
 * Un color por canal de ingreso. Airbnb lleva el terracota de la marca porque
 * es el mismo con el que aparece en el gráfico de ingresos por fuente.
 */
export const TRANSACTION_SOURCE_TONE: Record<TransactionSource, BadgeTone> = Object.freeze({
  [TransactionSource.AIRBNB]: 'primary',
  [TransactionSource.CONTRACT]: 'blue',
  [TransactionSource.OTHER]: 'gray',
})

/** Las modalidades comparten los colores de las fuentes de ingreso equivalentes. */
export const RENTAL_MODE_TONE: Record<RentalMode, BadgeTone> = Object.freeze({
  [RentalMode.AIRBNB]: 'primary',
  [RentalMode.FIXED_CONTRACT]: 'blue',
  [RentalMode.BOTH]: 'dark',
})

/** El administrador se destaca porque es el rol con permisos sobre todo el sistema. */
export const USER_ROLE_TONE: Record<UserRole, BadgeTone> = Object.freeze({
  [UserRole.ADMIN]: 'dark',
  [UserRole.USER]: 'gray',
})
