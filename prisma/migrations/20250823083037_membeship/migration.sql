-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'MEMBER';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "fullName" TEXT;
