import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1728465306242 implements MigrationInterface {
  name = 'Db1728465306242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "estate_members" ADD "nickname" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "estate_members" DROP COLUMN "nickname"`,
    );
  }
}
