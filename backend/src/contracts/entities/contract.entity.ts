import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm'
import type { Relation } from 'typeorm'
import type { ContractStatus } from '../../domain/enums.js'
import { Property } from '../../properties/entities/property.entity.js'

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Relation<Property>

  /** Id plano de la propiedad arrendada; es el que consume el frontend. */
  @RelationId((contract: Contract) => contract.property)
  propertyId: string

  /** Canon mensual pactado, en pesos. */
  @Column({ type: 'integer' })
  fixedRent: number

  /** Fecha ISO 'YYYY-MM-DD' de inicio de vigencia. */
  @Column()
  startDate: string

  /** Fecha ISO 'YYYY-MM-DD' de fin de vigencia. */
  @Column()
  endDate: string

  @Column()
  tenantName: string

  @Column()
  tenantContact: string

  @Column()
  status: ContractStatus
}
