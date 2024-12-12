import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1733974971952 implements MigrationInterface {
  name = 'Db1733974971952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" RENAME COLUMN "faceEncoding" TO "idCode"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recognized_faces" RENAME COLUMN "idCode" TO "faceEncoding"`,
    );
  }
}
