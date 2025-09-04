-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isMembership" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3);
