import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1733737682027 implements MigrationInterface {
  name = 'Db1733737682027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "recognized_faces" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, "deletedAt" TIMESTAMP, "deletedById" integer, "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255), "faceEncoding" text NOT NULL, "imageUrl" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "deviceId" integer NOT NULL, CONSTRAINT "PK_6b11d8e03f149fcc7c4f0fcbca4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "faceRecognitionEnabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" ADD CONSTRAINT "FK_2c46e769e295c4371952b8ace7a" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" DROP CONSTRAINT "FK_2c46e769e295c4371952b8ace7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP COLUMN "faceRecognitionEnabled"`,
    );
    await queryRunner.query(`DROP TABLE "recognized_faces"`);
  }
}
