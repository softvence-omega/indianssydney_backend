-- CreateEnum
CREATE TYPE "public"."CommentStatus" AS ENUM ('PENDING', 'APPROVE', 'Declined');

-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "status" "public"."CommentStatus" NOT NULL DEFAULT 'PENDING';
