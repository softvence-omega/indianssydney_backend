-- DropForeignKey
ALTER TABLE "public"."user_profiles" DROP CONSTRAINT "user_profiles_userId_fkey";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "profilePhoto" TEXT;
