/*
  Warnings:

  - You are about to drop the column `thamble` on the `CommunityPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."CommunityPost" DROP COLUMN "thamble",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "thumbnail" TEXT;
