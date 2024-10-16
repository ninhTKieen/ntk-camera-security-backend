import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1729054572067 implements MigrationInterface {
  name = 'Db1729054572067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "rtsp" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "serial" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "brand" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "mac" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "mac"`);
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "brand"`);
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "serial"`);
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "rtsp"`);
  }
}
