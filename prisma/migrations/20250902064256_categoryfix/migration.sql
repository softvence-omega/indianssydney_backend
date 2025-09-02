/*
  Warnings:

  - A unique constraint covering the columns `[subslug]` on the table `sub_categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tamplate` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "tamplate" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."sub_categories" ADD COLUMN     "subslug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_subslug_key" ON "public"."sub_categories"("subslug");
