/*
  Warnings:

  - The `type` column on the `additional_contents` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."AdditionalContentType" AS ENUM ('image', 'video', 'audio', 'paragraph', 'shortQuote');

-- AlterTable
ALTER TABLE "public"."additional_contents" DROP COLUMN "type",
ADD COLUMN     "type" "public"."AdditionalContentType";
