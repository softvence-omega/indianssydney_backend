-- CreateTable
CREATE TABLE "public"."ai_paragraph_generations" (
    "id" TEXT NOT NULL,
    "paragraph" TEXT,
    "originalParagraph" TEXT,
    "generatedContent" TEXT NOT NULL,
    "wordCount" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_paragraph_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_seo_tags" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "tags" TEXT[],
    "meta_keywords" TEXT[],
    "title_suggestions" TEXT[],
    "meta_description" TEXT,
    "long_tail_keywords" TEXT[],
    "hashtags" TEXT[],
    "content_keywords" TEXT[],
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error_message" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_seo_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_paragraph_generations_createdAt_idx" ON "public"."ai_paragraph_generations"("createdAt");

-- CreateIndex
CREATE INDEX "ai_seo_tags_category_subcategory_idx" ON "public"."ai_seo_tags"("category", "subcategory");
