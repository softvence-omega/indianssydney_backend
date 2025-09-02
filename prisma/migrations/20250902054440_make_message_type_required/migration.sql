/*
  Warnings:

  - You are about to drop the column `meta` on the `Notification` table. All the data in the column will be lost.
  - Made the column `title` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `message` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'Shift';
ALTER TYPE "public"."NotificationType" ADD VALUE 'UrgentShiftChanged';

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "meta",
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "message" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL;
