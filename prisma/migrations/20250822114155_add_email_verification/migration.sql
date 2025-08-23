/*
  Warnings:

  - You are about to drop the `user_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "emailOtp" INTEGER,
ADD COLUMN     "otpExpiry" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."user_profiles";
