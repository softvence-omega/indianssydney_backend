/*
  Warnings:

  - You are about to drop the column `additionalFieldId` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the `additional_fields` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."contents" DROP CONSTRAINT "contents_additionalFieldId_fkey";

-- DropIndex
DROP INDEX "public"."contents_additionalFieldId_key";

-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "additionalFieldId",
ADD COLUMN     "additionalField" JSONB;

-- DropTable
DROP TABLE "public"."additional_fields";
