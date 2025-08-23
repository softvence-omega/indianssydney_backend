-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "resetOtp" INTEGER,
ADD COLUMN     "resetOtpExpiry" TIMESTAMP(3);
