// --- External imports ---
import { MigrationInterface, QueryRunner } from 'typeorm';

// --- Exported members ---
export class PropertyUserForeignKey1793595073942 implements MigrationInterface {
  name = 'PropertyUserForeignKey1793595073942';

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transaction" RENAME TO "temporary_transaction"`);
    await queryRunner.query(
      `CREATE TABLE "transaction" ("amount" integer NOT NULL, "date" varchar NOT NULL, "description" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "source" varchar NOT NULL, "type" varchar NOT NULL, "propertyId" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "transaction"("amount", "date", "description", "id", "source", "type", "propertyId") SELECT "amount", "date", "description", "id", "source", "type", "propertyId" FROM "temporary_transaction"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_transaction"`);
    await queryRunner.query(`ALTER TABLE "contract" RENAME TO "temporary_contract"`);
    await queryRunner.query(
      `CREATE TABLE "contract" ("endDate" varchar NOT NULL, "fixedRent" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "startDate" varchar NOT NULL, "status" varchar NOT NULL, "tenantContact" varchar NOT NULL, "tenantName" varchar NOT NULL, "propertyId" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "contract"("endDate", "fixedRent", "id", "startDate", "status", "tenantContact", "tenantName", "propertyId") SELECT "endDate", "fixedRent", "id", "startDate", "status", "tenantContact", "tenantName", "propertyId" FROM "temporary_contract"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_contract"`);
    await queryRunner.query(`ALTER TABLE "property" RENAME TO "temporary_property"`);
    await queryRunner.query(
      `CREATE TABLE "property" ("address" varchar NOT NULL, "adminFee" integer NOT NULL, "city" varchar NOT NULL, "estimatedMonthlyRent" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "latitude" real, "longitude" real, "name" varchar NOT NULL, "otherFixedCosts" integer NOT NULL, "rentalMode" varchar NOT NULL, "status" varchar NOT NULL, "type" varchar NOT NULL, "userId" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "property"("address", "adminFee", "city", "estimatedMonthlyRent", "id", "latitude", "longitude", "name", "otherFixedCosts", "rentalMode", "status", "type", "userId") SELECT "address", "adminFee", "city", "estimatedMonthlyRent", "id", "latitude", "longitude", "name", "otherFixedCosts", "rentalMode", "status", "type", "userId" FROM "temporary_property"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_property"`);
    await queryRunner.query(`ALTER TABLE "transaction" RENAME TO "temporary_transaction"`);
    await queryRunner.query(
      `CREATE TABLE "transaction" ("amount" integer NOT NULL, "date" varchar NOT NULL, "description" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "source" varchar NOT NULL, "type" varchar NOT NULL, "propertyId" varchar, CONSTRAINT "FK_e58c3b8c65d0ed30f1ac77260bf" FOREIGN KEY ("propertyId") REFERENCES "property" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "transaction"("amount", "date", "description", "id", "source", "type", "propertyId") SELECT "amount", "date", "description", "id", "source", "type", "propertyId" FROM "temporary_transaction"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_transaction"`);
    await queryRunner.query(`ALTER TABLE "contract" RENAME TO "temporary_contract"`);
    await queryRunner.query(
      `CREATE TABLE "contract" ("endDate" varchar NOT NULL, "fixedRent" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "startDate" varchar NOT NULL, "status" varchar NOT NULL, "tenantContact" varchar NOT NULL, "tenantName" varchar NOT NULL, "propertyId" varchar, CONSTRAINT "FK_941cd11e8b67201836579929ced" FOREIGN KEY ("propertyId") REFERENCES "property" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "contract"("endDate", "fixedRent", "id", "startDate", "status", "tenantContact", "tenantName", "propertyId") SELECT "endDate", "fixedRent", "id", "startDate", "status", "tenantContact", "tenantName", "propertyId" FROM "temporary_contract"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_contract"`);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_contract" ("endDate" varchar NOT NULL, "fixedRent" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "startDate" varchar NOT NULL, "status" varchar NOT NULL, "tenantContact" varchar NOT NULL, "tenantName" varchar NOT NULL, "propertyId" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_contract"("endDate", "fixedRent", "id", "startDate", "status", "tenantContact", "tenantName", "propertyId") SELECT "endDate", "fixedRent", "id", "startDate", "status", "tenantContact", "tenantName", "propertyId" FROM "contract"`,
    );
    await queryRunner.query(`DROP TABLE "contract"`);
    await queryRunner.query(`ALTER TABLE "temporary_contract" RENAME TO "contract"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_transaction" ("amount" integer NOT NULL, "date" varchar NOT NULL, "description" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "source" varchar NOT NULL, "type" varchar NOT NULL, "propertyId" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_transaction"("amount", "date", "description", "id", "source", "type", "propertyId") SELECT "amount", "date", "description", "id", "source", "type", "propertyId" FROM "transaction"`,
    );
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`ALTER TABLE "temporary_transaction" RENAME TO "transaction"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_property" ("address" varchar NOT NULL, "adminFee" integer NOT NULL, "city" varchar NOT NULL, "estimatedMonthlyRent" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "latitude" real, "longitude" real, "name" varchar NOT NULL, "otherFixedCosts" integer NOT NULL, "rentalMode" varchar NOT NULL, "status" varchar NOT NULL, "type" varchar NOT NULL, "userId" varchar, CONSTRAINT "FK_d90007b39cfcf412e15823bebc1" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_property"("address", "adminFee", "city", "estimatedMonthlyRent", "id", "latitude", "longitude", "name", "otherFixedCosts", "rentalMode", "status", "type", "userId") SELECT "address", "adminFee", "city", "estimatedMonthlyRent", "id", "latitude", "longitude", "name", "otherFixedCosts", "rentalMode", "status", "type", "userId" FROM "property"`,
    );
    await queryRunner.query(`DROP TABLE "property"`);
    await queryRunner.query(`ALTER TABLE "temporary_property" RENAME TO "property"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_contract" ("endDate" varchar NOT NULL, "fixedRent" integer NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "startDate" varchar NOT NULL, "status" varchar NOT NULL, "tenantContact" varchar NOT NULL, "tenantName" varchar NOT NULL, "propertyId" varchar, CONSTRAINT "FK_941cd11e8b67201836579929ced" FOREIGN KEY ("propertyId") REFERENCES "property" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_contract"("endDate", "fixedRent", "id", "startDate", "status", "tenantContact", "tenantName", "propertyId") SELECT "endDate", "fixedRent", "id", "startDate", "status", "tenantContact", "tenantName", "propertyId" FROM "contract"`,
    );
    await queryRunner.query(`DROP TABLE "contract"`);
    await queryRunner.query(`ALTER TABLE "temporary_contract" RENAME TO "contract"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_transaction" ("amount" integer NOT NULL, "date" varchar NOT NULL, "description" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "source" varchar NOT NULL, "type" varchar NOT NULL, "propertyId" varchar, CONSTRAINT "FK_e58c3b8c65d0ed30f1ac77260bf" FOREIGN KEY ("propertyId") REFERENCES "property" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_transaction"("amount", "date", "description", "id", "source", "type", "propertyId") SELECT "amount", "date", "description", "id", "source", "type", "propertyId" FROM "transaction"`,
    );
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`ALTER TABLE "temporary_transaction" RENAME TO "transaction"`);
  }
}
