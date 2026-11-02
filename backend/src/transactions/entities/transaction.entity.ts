// --- External imports ---
import type { Relation } from 'typeorm';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';

// --- Internal imports ---
import type { TransactionSource } from '../../domain/enums/transaction-source.js';
import type { TransactionType } from '../../domain/enums/transaction-type.js';
import { Property } from '../../properties/entities/property.entity.js';

// --- Exported members ---
@Entity()
export class Transaction {
  @Column({ type: 'integer' })
  amount: number;

  @Column()
  date: string;

  @Column()
  description: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Relation<Property>;

  @RelationId((transaction: Transaction) => transaction.property)
  propertyId: string;

  @Column()
  source: TransactionSource;

  @Column()
  type: TransactionType;
}
