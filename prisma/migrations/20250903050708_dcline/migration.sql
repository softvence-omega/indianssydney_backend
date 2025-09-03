-- AlterEnum
ALTER TYPE "public"."Status" ADD VALUE 'Declined';

-- AlterTable
ALTER TABLE "public"."additional_contents" ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "value" DROP NOT NULL;
