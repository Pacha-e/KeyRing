import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm'
import type { Relation } from 'typeorm'
import type { TransactionSource, TransactionType } from '../../domain/enums.js'
import { Property } from '../../properties/entities/property.entity.js'

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Relation<Property>

  /** Id plano de la propiedad a la que pertenece el movimiento. */
  @RelationId((transaction: Transaction) => transaction.property)
  propertyId: string

  @Column()
  type: TransactionType

  @Column()
  source: TransactionSource

  /** Monto del movimiento, en pesos; siempre positivo. */
  @Column({ type: 'integer' })
  amount: number

  /** Fecha ISO 'YYYY-MM-DD' del movimiento. */
  @Column()
  date: string

  @Column()
  description: string
}
