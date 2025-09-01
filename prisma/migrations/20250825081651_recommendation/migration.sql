-- CreateTable
CREATE TABLE "public"."recommendation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_recommendation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_recommendation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_recommendation_B_index" ON "public"."_recommendation"("B");

-- AddForeignKey
ALTER TABLE "public"."_recommendation" ADD CONSTRAINT "_recommendation_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_recommendation" ADD CONSTRAINT "_recommendation_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
