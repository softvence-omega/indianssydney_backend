/*
  Warnings:

  - You are about to drop the `raffle_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."raffle_images" DROP CONSTRAINT "raffle_images_reportId_fkey";

-- DropTable
DROP TABLE "public"."raffle_images";

-- CreateTable
CREATE TABLE "public"."screenshort_images" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screenshort_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."screenshort_images" ADD CONSTRAINT "screenshort_images_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."ReportContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
