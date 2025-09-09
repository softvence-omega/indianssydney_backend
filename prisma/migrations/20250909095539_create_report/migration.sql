-- CreateTable
CREATE TABLE "public"."ReportContent" (
    "id" TEXT NOT NULL,
    "contentTitle" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "ScreenShort" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReportContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."raffle_images" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raffle_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ReportContent" ADD CONSTRAINT "ReportContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."raffle_images" ADD CONSTRAINT "raffle_images_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."ReportContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
