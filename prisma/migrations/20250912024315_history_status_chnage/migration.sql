-- CreateTable
CREATE TABLE "public"."content_status_histories" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "oldStatus" "public"."Status" NOT NULL,
    "newStatus" "public"."Status" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_status_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."content_status_histories" ADD CONSTRAINT "content_status_histories_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_status_histories" ADD CONSTRAINT "content_status_histories_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
