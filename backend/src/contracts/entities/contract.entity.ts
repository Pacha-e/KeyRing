// --- External imports ---
import type { Relation } from 'typeorm';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';

// --- Internal imports ---
import type { ContractStatus } from '../../domain/enums/contract-status.js';
import { Property } from '../../properties/entities/property.entity.js';

// --- Exported members ---
@Entity()
export class Contract {
  @Column()
  endDate: string;

  @Column({ type: 'integer' })
  fixedRent: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Relation<Property>;

  @RelationId((contract: Contract) => contract.property)
  propertyId: string;

  @Column()
  startDate: string;

  @Column()
  status: ContractStatus;

  @Column()
  tenantContact: string;

  @Column()
  tenantName: string;
}
