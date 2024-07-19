import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1721383433659 implements MigrationInterface {
  name = 'Db1721383433659';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fcm_tokens" ADD "deviceId" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fcm_tokens" DROP COLUMN "deviceId"`);
  }
}
