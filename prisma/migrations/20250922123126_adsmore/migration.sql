-- CreateEnum
CREATE TYPE "public"."AdsPostion" AS ENUM ('FRONTPAGE', 'CATEGORYPAGE');

-- AlterTable
ALTER TABLE "public"."Ads" ADD COLUMN     "adsposition" "public"."AdsPostion",
ADD COLUMN     "subtitle" TEXT,
ALTER COLUMN "link" DROP NOT NULL;
