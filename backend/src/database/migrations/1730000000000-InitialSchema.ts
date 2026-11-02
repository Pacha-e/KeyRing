// --- External imports ---
import { MigrationInterface, QueryRunner } from 'typeorm';

// --- Exported members ---
export class InitialSchema1730000000000 implements MigrationInterface {
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "transaction"');
    await queryRunner.query('DROP TABLE "contract"');
    await queryRunner.query('DROP TABLE "property"');
    await queryRunner.query('DROP TABLE "user"');
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "user" ("city" varchar NOT NULL, "email" varchar NOT NULL, "fullName" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "memberSince" varchar NOT NULL, "password" varchar NOT NULL, "phone" varchar NOT NULL, "role" varchar NOT NULL, CONSTRAINT "UQ_user_email" UNIQUE ("email"))',
    );
    await queryRunner.query(
      'CREATE TABLE "property" ("address" varchar NOT NULL, "adminFee" integer NOT NULL, "city" varchar NOT NULL, "estimatedMonthlyRent" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "latitude" real, "longitude" real, "name" varchar NOT NULL, "otherFixedCosts" integer NOT NULL, "rentalMode" varchar NOT NULL, "status" varchar NOT NULL, "type" varchar NOT NULL, "userId" varchar)',
    );
    await queryRunner.query(
      'CREATE TABLE "contract" ("endDate" varchar NOT NULL, "fixedRent" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "startDate" varchar NOT NULL, "status" varchar NOT NULL, "tenantContact" varchar NOT NULL, "tenantName" varchar NOT NULL, "propertyId" varchar, FOREIGN KEY ("propertyId") REFERENCES "property" ("id") ON DELETE CASCADE)',
    );
    await queryRunner.query(
      'CREATE TABLE "transaction" ("amount" integer NOT NULL, "date" varchar NOT NULL, "description" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "source" varchar NOT NULL, "type" varchar NOT NULL, "propertyId" varchar, FOREIGN KEY ("propertyId") REFERENCES "property" ("id") ON DELETE CASCADE)',
    );
  }
}
