/*
  Warnings:

  - The `compareResult` column on the `contents` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "compareResult",
ADD COLUMN     "compareResult" JSONB;
