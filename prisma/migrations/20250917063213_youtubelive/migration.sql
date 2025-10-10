/*
  Warnings:

  - You are about to drop the column `channelName` on the `LiveEvent` table. All the data in the column will be lost.
  - You are about to drop the column `rtcToken` on the `LiveEvent` table. All the data in the column will be lost.
  - You are about to drop the column `rtmToken` on the `LiveEvent` table. All the data in the column will be lost.
  - You are about to drop the column `uid` on the `LiveEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."LiveEvent" DROP COLUMN "channelName",
DROP COLUMN "rtcToken",
DROP COLUMN "rtmToken",
DROP COLUMN "uid",
ADD COLUMN     "youtubeUrl" TEXT;
