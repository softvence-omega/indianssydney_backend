/*
  Warnings:

  - You are about to drop the column `ContetentStatus` on the `NotificationToggle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."NotificationToggle" DROP COLUMN "ContetentStatus",
ADD COLUMN     "communication" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contentStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "surveyAndPoll" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tasksAndProjects" BOOLEAN NOT NULL DEFAULT false;
