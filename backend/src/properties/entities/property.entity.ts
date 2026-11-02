// --- External imports ---
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// --- Internal imports ---
import type { PropertyStatus } from '../../domain/enums/property-status.js';
import type { PropertyType } from '../../domain/enums/property-type.js';
import type { RentalMode } from '../../domain/enums/rental-mode.js';

// --- Exported members ---
@Entity()
export class Property {
  @Column()
  address: string;

  @Column({ type: 'integer' })
  adminFee: number;

  @Column()
  city: string;

  @Column({ type: 'integer' })
  estimatedMonthlyRent: number;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'real', nullable: true })
  latitude: number | null;

  @Column({ type: 'real', nullable: true })
  longitude: number | null;

  @Column()
  name: string;

  @Column({ type: 'integer' })
  otherFixedCosts: number;

  @Column()
  rentalMode: RentalMode;

  @Column()
  status: PropertyStatus;

  @Column()
  type: PropertyType;

  @Column({ type: 'varchar', nullable: true })
  userId: string | null;
}
