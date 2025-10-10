/*
  Warnings:

  - Added the required column `contentId` to the `ReportContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ReportContent" ADD COLUMN     "contentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ReportContent" ADD CONSTRAINT "ReportContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
