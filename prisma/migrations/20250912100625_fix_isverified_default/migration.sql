-- CreateEnum
CREATE TYPE "public"."LanguageType" AS ENUM ('English', 'Hindi');

-- CreateTable
CREATE TABLE "public"."PrivacyPolicy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtext" TEXT NOT NULL,

    CONSTRAINT "PrivacyPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TermsConditions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "TermsConditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FaqSection" (
    "id" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,

    CONSTRAINT "FaqSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Language" (
    "id" TEXT NOT NULL,
    "language" "public"."LanguageType" NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "adsimage" TEXT,

    CONSTRAINT "Ads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyPolicy_title_key" ON "public"."PrivacyPolicy"("title");

-- CreateIndex
CREATE UNIQUE INDEX "TermsConditions_title_key" ON "public"."TermsConditions"("title");

-- AddForeignKey
ALTER TABLE "public"."Faq" ADD CONSTRAINT "Faq_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."FaqSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
