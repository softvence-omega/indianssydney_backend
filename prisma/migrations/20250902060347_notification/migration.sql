/*
  Warnings:

  - Added the required column `meta` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "meta" JSONB NOT NULL;
