/*
  Warnings:

  - You are about to drop the column `additionalField` on the `contents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "additionalField";

-- CreateTable
CREATE TABLE "public"."additional_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "additional_contents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."additional_contents" ADD CONSTRAINT "additional_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
