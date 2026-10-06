import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import type { PropertyStatus, PropertyType, RentalMode } from '../../domain/enums.js'

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  address: string

  @Column()
  city: string

  @Column()
  type: PropertyType

  @Column()
  rentalMode: RentalMode

  @Column()
  status: PropertyStatus

  /** Arriendo mensual estimado, en pesos. */
  @Column({ type: 'integer' })
  estimatedMonthlyRent: number

  /** Cuota de administración mensual, en pesos. */
  @Column({ type: 'integer' })
  adminFee: number

  @Column({ type: 'integer' })
  otherFixedCosts: number

  /** Id del usuario dueño. La relación vive aquí, no anidada en User. */
  @Column({ type: 'varchar', nullable: true })
  ownerId: string | null

  /** Coordenadas opcionales para el mapa. */
  @Column({ type: 'real', nullable: true })
  latitude: number | null

  @Column({ type: 'real', nullable: true })
  longitude: number | null
}
