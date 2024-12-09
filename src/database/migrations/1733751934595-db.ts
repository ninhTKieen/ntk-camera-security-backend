import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1733751934595 implements MigrationInterface {
  name = 'Db1733751934595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" DROP CONSTRAINT "FK_2c46e769e295c4371952b8ace7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" RENAME COLUMN "deviceId" TO "estateId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" ADD CONSTRAINT "FK_df346f4fff0322528bb20e41e23" FOREIGN KEY ("estateId") REFERENCES "estates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" DROP CONSTRAINT "FK_df346f4fff0322528bb20e41e23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" RENAME COLUMN "estateId" TO "deviceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" ADD CONSTRAINT "FK_2c46e769e295c4371952b8ace7a" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
