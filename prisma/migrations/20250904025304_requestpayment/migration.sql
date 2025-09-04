/*
  Warnings:

  - Added the required column `planId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "planId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
