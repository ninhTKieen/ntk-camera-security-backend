import { MigrationInterface, QueryRunner } from 'typeorm';

export class Db1729578729785 implements MigrationInterface {
  name = 'Db1729578729785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "devices" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, "deletedAt" TIMESTAMP, "deletedById" integer, "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255), "ipCamera" character varying(255) NOT NULL, "rtsp" character varying, "model" character varying, "serial" character varying, "brand" character varying, "mac" character varying, "estateId" integer NOT NULL, "areaId" integer, CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "areas" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, "deletedAt" TIMESTAMP, "deletedById" integer, "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255), "estateId" integer NOT NULL, CONSTRAINT "PK_5110493f6342f34c978c084d0d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "estates" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" integer, "deletedAt" TIMESTAMP, "deletedById" integer, "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "type" character varying NOT NULL, "description" character varying, "imageUrls" text, "imageUrlIds" text, "long" numeric(10,7), "lat" numeric(10,7), "address" character varying(255), CONSTRAINT "PK_e6e88990dece2b27b551fe6c7b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "estate_members" ("id" SERIAL NOT NULL, "role" "public"."estate_members_role_enum" NOT NULL, "nickname" character varying, "status" "public"."estate_members_status_enum", "userId" integer NOT NULL, "estateId" integer NOT NULL, CONSTRAINT "PK_8bf1c7010d8c2ef7d48ecc9ef64" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_3c3a78312350a9a5c555a651de9" FOREIGN KEY ("estateId") REFERENCES "estates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_911d95ba4b8753be7117fd69932" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "areas" ADD CONSTRAINT "FK_b447ee567355b06fc13fa0eb241" FOREIGN KEY ("estateId") REFERENCES "estates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "areas" DROP CONSTRAINT "FK_b447ee567355b06fc13fa0eb241"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_911d95ba4b8753be7117fd69932"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_3c3a78312350a9a5c555a651de9"`,
    );
    await queryRunner.query(`DROP TABLE "estate_members"`);
    await queryRunner.query(`DROP TABLE "estates"`);
    await queryRunner.query(`DROP TABLE "areas"`);
    await queryRunner.query(`DROP TABLE "devices"`);
  }
}
