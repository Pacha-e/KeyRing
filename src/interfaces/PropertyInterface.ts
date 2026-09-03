import type { PropertyType, RentalMode, PropertyStatus } from './enums'

export interface PropertyInterface {
  id: string
  name: string
  address: string
  city: string
  type: PropertyType
  rentalMode: RentalMode
  status: PropertyStatus
  estimatedMonthlyRent: number
  adminFee: number
  otherFixedCosts: number
  /** id del usuario dueño de la propiedad */
  ownerId: string | null
}
