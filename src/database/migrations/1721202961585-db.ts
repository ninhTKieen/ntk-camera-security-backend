import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1721202961585 implements MigrationInterface {
  name = 'Db1721202961585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."fcm_tokens_webapptype_enum" AS ENUM('ADMIN', 'WEB', 'MOBILE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "fcm_tokens" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, "deletedAt" TIMESTAMP, "deletedById" integer, "id" SERIAL NOT NULL, "token" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "language" character varying, "webAppType" "public"."fcm_tokens_webapptype_enum" NOT NULL, "user_id" integer, CONSTRAINT "PK_0802a779d616597e9330bb9a7cc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "fcm_tokens" ADD CONSTRAINT "FK_9fd867cabc75028a5625ce7b24c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fcm_tokens" DROP CONSTRAINT "FK_9fd867cabc75028a5625ce7b24c"`,
    );
    await queryRunner.query(`DROP TABLE "fcm_tokens"`);
    await queryRunner.query(`DROP TYPE "public"."fcm_tokens_webapptype_enum"`);
  }
}
