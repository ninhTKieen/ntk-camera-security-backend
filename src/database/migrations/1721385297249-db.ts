import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1721385297249 implements MigrationInterface {
  name = 'Db1721385297249';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fcm_tokens" DROP COLUMN "date"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fcm_tokens" ADD "date" TIMESTAMP NOT NULL`,
    );
  }
}
