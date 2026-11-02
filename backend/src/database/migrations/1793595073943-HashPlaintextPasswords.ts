// --- External imports ---
import type { MigrationInterface, QueryRunner } from 'typeorm';

// --- Internal imports ---
import { PasswordHasher } from '../../common/utils/password-hasher.js';

// --- Types ---
interface StoredPassword {
  id: string;
  password: string;
}

// --- Exported members ---
export class HashPlaintextPasswords1793595073943 implements MigrationInterface {
  async down(): Promise<void> {
    // Password hashing is irreversible. Restore a backup to recover prior values.
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    const users: StoredPassword[] = await queryRunner.query(
      'SELECT id, password FROM "user" WHERE substr(password, 1, 4) NOT IN (?, ?)',
      ['$2a$', '$2b$'],
    );
    for (const user of users) {
      await queryRunner.query('UPDATE "user" SET password = ? WHERE id = ?', [
        await PasswordHasher.hash(user.password),
        user.id,
      ]);
    }
  }
}
