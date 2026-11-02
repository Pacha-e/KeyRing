// --- External imports ---
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';

// --- Internal imports ---
import { Contract } from '../contracts/entities/contract.entity.js';
import { Property } from '../properties/entities/property.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { User } from '../users/entities/user.entity.js';

// --- Constants ---
const database = process.env.DATABASE_PATH ?? 'data/keyring.sqlite';
const directory = dirname(fileURLToPath(import.meta.url));
mkdirSync(dirname(database), { recursive: true });

// --- Exported members ---
export const dataSource = new DataSource({
  database,
  entities: [Contract, Property, Transaction, User],
  migrations: [join(directory, 'migrations/*{.js,.ts}')],
  migrationsRun: true,
  synchronize: false,
  type: 'better-sqlite3',
});
