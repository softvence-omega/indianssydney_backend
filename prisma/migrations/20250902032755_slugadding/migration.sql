/*
  Warnings:

  - You are about to drop the column `description` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `sub_categories` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `sub_categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subname]` on the table `sub_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."sub_categories_name_key";

-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "description",
DROP COLUMN "icon",
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."sub_categories" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "subname" TEXT;

-- CreateTable
CREATE TABLE "public"."paypal_payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planAmount" DOUBLE PRECISION NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paypal_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_subname_key" ON "public"."sub_categories"("subname");

-- AddForeignKey
ALTER TABLE "public"."paypal_payments" ADD CONSTRAINT "paypal_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
