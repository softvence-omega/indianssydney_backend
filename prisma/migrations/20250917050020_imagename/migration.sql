/*
  Warnings:

  - You are about to drop the column `audioFile` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `videoFile` on the `contents` table. All the data in the column will be lost.
  - Made the column `adsimage` on table `Ads` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Ads" ALTER COLUMN "adsimage" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "audioFile",
DROP COLUMN "videoFile",
ADD COLUMN     "audio" TEXT,
ADD COLUMN     "video" TEXT;
