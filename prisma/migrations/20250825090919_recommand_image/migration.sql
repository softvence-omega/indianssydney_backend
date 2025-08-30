-- CreateTable
CREATE TABLE "public"."recommendation_images" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,

    CONSTRAINT "recommendation_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."recommendation_images" ADD CONSTRAINT "recommendation_images_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "public"."recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
