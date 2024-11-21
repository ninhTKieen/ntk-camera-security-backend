import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1732210140084 implements MigrationInterface {
  name = 'Db1732210140084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "ipCamera"`);
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "rtsp"`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "streamLink" character varying(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "streamLink"`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "rtsp" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "ipCamera" character varying(255) NOT NULL`,
    );
  }
}
