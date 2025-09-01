/*
  Warnings:

  - You are about to drop the column `body` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `contentId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `deepLink` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `sentToTopic` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `DeviceToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationRecipient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_NotificationToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('TimeOff', 'Announcement', 'Task', 'Recognition');

-- DropForeignKey
ALTER TABLE "public"."DeviceToken" DROP CONSTRAINT "DeviceToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NotificationRecipient" DROP CONSTRAINT "NotificationRecipient_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NotificationRecipient" DROP CONSTRAINT "NotificationRecipient_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_NotificationToUser" DROP CONSTRAINT "_NotificationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_NotificationToUser" DROP CONSTRAINT "_NotificationToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_images" DROP CONSTRAINT "content_images_contentsId_fkey";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "body",
DROP COLUMN "contentId",
DROP COLUMN "contentType",
DROP COLUMN "deepLink",
DROP COLUMN "imageUrl",
DROP COLUMN "sentToTopic",
DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "type" "public"."NotificationType",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "title" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."DeviceToken";

-- DropTable
DROP TABLE "public"."NotificationRecipient";

-- DropTable
DROP TABLE "public"."_NotificationToUser";

-- DropTable
DROP TABLE "public"."content_images";

-- CreateTable
CREATE TABLE "public"."NotificationToggle" (
    "id" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "userUpdates" BOOLEAN NOT NULL DEFAULT false,
    "ContetentStatus" BOOLEAN NOT NULL DEFAULT false,
    "scheduling" BOOLEAN NOT NULL DEFAULT false,
    "message" BOOLEAN NOT NULL DEFAULT false,
    "userRegistration" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NotificationToggle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationToggle_userId_key" ON "public"."NotificationToggle"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_userId_notificationId_key" ON "public"."UserNotification"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "public"."NotificationToggle" ADD CONSTRAINT "NotificationToggle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNotification" ADD CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
