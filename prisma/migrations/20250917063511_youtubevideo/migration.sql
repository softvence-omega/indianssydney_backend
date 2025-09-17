/*
  Warnings:

  - You are about to drop the column `youtubeUrl` on the `LiveEvent` table. All the data in the column will be lost.
  - Added the required column `youtubeLiveUrl` to the `LiveEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."LiveEvent" DROP COLUMN "youtubeUrl",
ADD COLUMN     "youtubeLiveUrl" TEXT NOT NULL;
