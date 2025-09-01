/*
  Warnings:

  - You are about to drop the column `about` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `additionalAudio` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `additionalImage` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `additionalQuote` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `additionalThumbail` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `additionalparagraph` on the `contents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "about",
DROP COLUMN "additionalAudio",
DROP COLUMN "additionalImage",
DROP COLUMN "additionalQuote",
DROP COLUMN "additionalThumbail",
DROP COLUMN "additionalparagraph",
ADD COLUMN     "additionalFiledId" TEXT;

-- CreateTable
CREATE TABLE "public"."additional_fileds" (
    "id" TEXT NOT NULL,
    "additionalImage" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalAudio" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalQuote" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalThumbail" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalparagraph" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "additional_fileds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_additionalFiledId_fkey" FOREIGN KEY ("additionalFiledId") REFERENCES "public"."additional_fileds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
