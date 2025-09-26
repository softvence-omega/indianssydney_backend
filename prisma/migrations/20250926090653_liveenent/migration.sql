/*
  Warnings:

  - You are about to drop the column `thumbail` on the `LiveEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."LiveEvent" DROP COLUMN "thumbail",
ADD COLUMN     "thumbnail" TEXT;
