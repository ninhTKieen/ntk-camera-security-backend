import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1718173964067 implements MigrationInterface {
  name = 'Db1718173964067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, "deletedAt" TIMESTAMP, "deletedById" integer, "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "phoneNumber" character varying, "imageUrl" character varying, "imageUrlId" character varying, "gender" "public"."users_gender_enum", "dateOfBirth" TIMESTAMP, "role" "public"."users_role_enum" NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
  }
}
