/*
  Warnings:

  - You are about to drop the column `chooseDate` on the `LiveEvent` table. All the data in the column will be lost.
  - You are about to drop the column `chooseTime` on the `LiveEvent` table. All the data in the column will be lost.
  - Added the required column `channelName` to the `LiveEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `LiveEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `LiveEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `LiveEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."LiveEvent" DROP COLUMN "chooseDate",
DROP COLUMN "chooseTime",
ADD COLUMN     "channelName" TEXT NOT NULL,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "rtcToken" TEXT,
ADD COLUMN     "rtmToken" TEXT,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uid" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "thumbail" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."LiveEvent" ADD CONSTRAINT "LiveEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
