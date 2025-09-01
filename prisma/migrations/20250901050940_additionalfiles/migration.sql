/*
  Warnings:

  - The values [LIVE_EVENT] on the enum `ContentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `additionalFiledId` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the `AdditionalFiled` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ContentType_new" AS ENUM ('ARTICLE', 'PODCAST', 'VIDEO');
ALTER TABLE "public"."chooose-category" ALTER COLUMN "contenttype" TYPE "public"."ContentType_new" USING ("contenttype"::text::"public"."ContentType_new");
ALTER TABLE "public"."contents" ALTER COLUMN "contentType" TYPE "public"."ContentType_new" USING ("contentType"::text::"public"."ContentType_new");
ALTER TYPE "public"."ContentType" RENAME TO "ContentType_old";
ALTER TYPE "public"."ContentType_new" RENAME TO "ContentType";
DROP TYPE "public"."ContentType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."contents" DROP CONSTRAINT "contents_additionalFiledId_fkey";

-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "additionalFiledId",
ADD COLUMN     "additionalAudio" TEXT,
ADD COLUMN     "additionalImage" TEXT,
ADD COLUMN     "additionalQuote" TEXT,
ADD COLUMN     "additionalThumbail" TEXT,
ADD COLUMN     "additionalparagraph" TEXT;

-- DropTable
DROP TABLE "public"."AdditionalFiled";

-- DropEnum
DROP TYPE "public"."Filedtype";
