import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1729521240254 implements MigrationInterface {
  name = 'Db1729521240254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."estate_members_status_enum" AS ENUM('JOINED', 'PENDING', 'BLOCKED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "estate_members" ("id" SERIAL NOT NULL, "role" "public"."estate_members_role_enum" NOT NULL, "nickname" character varying, "status" "public"."estate_members_status_enum", "userId" integer NOT NULL, "estateId" integer NOT NULL, CONSTRAINT "PK_8bf1c7010d8c2ef7d48ecc9ef64" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "estate_members" ADD CONSTRAINT "FK_825406e09788af4dadc3d872956" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "estate_members" ADD CONSTRAINT "FK_07ff16b42e539b106dfd20e8bd9" FOREIGN KEY ("estateId") REFERENCES "estates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "estate_members" DROP CONSTRAINT "FK_07ff16b42e539b106dfd20e8bd9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "estate_members" DROP CONSTRAINT "FK_825406e09788af4dadc3d872956"`,
    );
    await queryRunner.query(`DROP TABLE "estate_members"`);
    await queryRunner.query(`DROP TYPE "public"."estate_members_status_enum"`);
  }
}
