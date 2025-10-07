/*
  Warnings:

  - You are about to drop the column `bot_response` on the `FaqBot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."FaqBot" DROP COLUMN "bot_response",
ADD COLUMN     "response" TEXT;
