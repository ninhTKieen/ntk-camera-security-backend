import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1729060181797 implements MigrationInterface {
  name = 'Db1729060181797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "devices" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, "deletedAt" TIMESTAMP, "deletedById" integer, "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255), "ipCamera" character varying(255) NOT NULL, "rtsp" character varying, "model" character varying, "serial" character varying, "brand" character varying, "mac" character varying, "estateId" integer NOT NULL, "areaId" integer, CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_3c3a78312350a9a5c555a651de9" FOREIGN KEY ("estateId") REFERENCES "estates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_911d95ba4b8753be7117fd69932" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_911d95ba4b8753be7117fd69932"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_3c3a78312350a9a5c555a651de9"`,
    );
    await queryRunner.query(`DROP TABLE "devices"`);
  }
}
