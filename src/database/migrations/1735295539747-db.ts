import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1735295539747 implements MigrationInterface {
  name = 'Db1735295539747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "imageUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "imageUrlId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "imageUrlId"`);
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "imageUrl"`);
  }
}
