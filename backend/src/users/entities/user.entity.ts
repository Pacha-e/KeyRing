// --- External imports ---
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// --- Internal imports ---
import type { UserRole } from '../../domain/enums/user-role.js';

// --- Exported members ---
@Entity()
export class User {
  @Column()
  city: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  memberSince: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column()
  role: UserRole;
}
