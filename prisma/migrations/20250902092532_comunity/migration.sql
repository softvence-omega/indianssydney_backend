/*
  Warnings:

  - You are about to drop the column `image` on the `CommunityPost` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `CommunityPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."CommunityPost" DROP COLUMN "image",
DROP COLUMN "thumbnail",
ADD COLUMN     "thamble" TEXT;
