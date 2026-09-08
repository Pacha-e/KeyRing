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
  /**
   * Coordenadas del inmueble, para situarlo en el mapa.
   *
   * Son opcionales porque una propiedad se puede registrar sin saberlas todavía;
   * cuando faltan, el mapa la sitúa en el centro de su ciudad y lo advierte.
   */
  latitude?: number
  longitude?: number
}
