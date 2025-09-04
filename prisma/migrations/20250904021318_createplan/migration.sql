/*
  Warnings:

  - You are about to drop the column `planId` on the `payments` table. All the data in the column will be lost.
  - Changed the type of `Price` on the `payment_plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_planId_fkey";

-- AlterTable
ALTER TABLE "public"."payment_plans" ALTER COLUMN "name" DROP NOT NULL,
DROP COLUMN "Price",
ADD COLUMN     "Price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."payments" DROP COLUMN "planId";
