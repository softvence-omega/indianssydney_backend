-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."ReportContent" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "public"."ReportStatus" NOT NULL DEFAULT 'PENDING';
