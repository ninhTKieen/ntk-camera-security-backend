import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1728397955758 implements MigrationInterface {
  name = 'Db1728397955758';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "estates" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, "deletedAt" TIMESTAMP, "deletedById" integer, "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "type" character varying NOT NULL, "description" character varying, "imageUrls" text, "imageUrlIds" text, "long" numeric(10,7), "lat" numeric(10,7), "address" character varying(255), CONSTRAINT "PK_e6e88990dece2b27b551fe6c7b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "estate_members" ("id" SERIAL NOT NULL, "role" "public"."estate_members_role_enum" NOT NULL, "userId" integer NOT NULL, "estateId" integer NOT NULL, CONSTRAINT "PK_8bf1c7010d8c2ef7d48ecc9ef64" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "estate_members" ADD CONSTRAINT "FK_825406e09788af4dadc3d872956" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "estate_members" ADD CONSTRAINT "FK_07ff16b42e539b106dfd20e8bd9" FOREIGN KEY ("estateId") REFERENCES "estates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
    await queryRunner.query(`DROP TABLE "estates"`);
  }
}
