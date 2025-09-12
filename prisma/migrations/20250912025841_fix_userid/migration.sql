/*
  Warnings:

  - You are about to drop the column `adminId` on the `content_status_histories` table. All the data in the column will be lost.
  - Added the required column `userId` to the `content_status_histories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."content_status_histories" DROP CONSTRAINT "content_status_histories_adminId_fkey";

-- AlterTable
ALTER TABLE "public"."content_status_histories" DROP COLUMN "adminId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."content_status_histories" ADD CONSTRAINT "content_status_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
