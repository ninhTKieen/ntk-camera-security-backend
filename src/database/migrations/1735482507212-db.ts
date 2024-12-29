import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1735482507212 implements MigrationInterface {
  name = 'Db1735482507212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "relays" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, "deletedAt" TIMESTAMP, "deletedById" integer, "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255), "ipAddress" character varying(255), "port" character varying(255), "uid" character varying(255) NOT NULL, "estateId" integer NOT NULL, CONSTRAINT "PK_edb2a59ea8ab0fdddd74ca949ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "relays" ADD CONSTRAINT "FK_c3e8c8ec1353044623e9abc5e40" FOREIGN KEY ("estateId") REFERENCES "estates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "relays" DROP CONSTRAINT "FK_c3e8c8ec1353044623e9abc5e40"`,
    );
    await queryRunner.query(`DROP TABLE "relays"`);
  }
}
