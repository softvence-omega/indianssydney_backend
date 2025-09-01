/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `categories` table. All the data in the column will be lost.
  - The `createdAt` column on the `categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `additionalFiledId` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `videothamble` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the `additional_fileds` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[additionalFieldId]` on the table `contents` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."contents" DROP CONSTRAINT "contents_additionalFiledId_fkey";

-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "updatedAt",
DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "additionalFiledId",
DROP COLUMN "videothamble",
ADD COLUMN     "additionalFieldId" TEXT,
ADD COLUMN     "videoThumbnail" TEXT;

-- DropTable
DROP TABLE "public"."additional_fileds";

-- CreateTable
CREATE TABLE "public"."additional_fields" (
    "id" TEXT NOT NULL,
    "additionalImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalAudios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalQuotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalThumbnails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalParagraphs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "additional_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contents_additionalFieldId_key" ON "public"."contents"("additionalFieldId");

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_additionalFieldId_fkey" FOREIGN KEY ("additionalFieldId") REFERENCES "public"."additional_fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;
