/*
  Warnings:

  - You are about to drop the column `pragraph` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the `_AdditionalFiledToContents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ContentCategories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ContentSubCategories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `additionalFiledId` to the `contents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `contents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCategoryId` to the `contents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_AdditionalFiledToContents" DROP CONSTRAINT "_AdditionalFiledToContents_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AdditionalFiledToContents" DROP CONSTRAINT "_AdditionalFiledToContents_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ContentCategories" DROP CONSTRAINT "_ContentCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ContentCategories" DROP CONSTRAINT "_ContentCategories_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ContentSubCategories" DROP CONSTRAINT "_ContentSubCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ContentSubCategories" DROP CONSTRAINT "_ContentSubCategories_B_fkey";

-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "pragraph",
ADD COLUMN     "additionalFiledId" TEXT NOT NULL,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "subCategoryId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_AdditionalFiledToContents";

-- DropTable
DROP TABLE "public"."_ContentCategories";

-- DropTable
DROP TABLE "public"."_ContentSubCategories";

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_additionalFiledId_fkey" FOREIGN KEY ("additionalFiledId") REFERENCES "public"."AdditionalFiled"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
