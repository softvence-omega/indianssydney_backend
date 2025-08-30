/*
  Warnings:

  - You are about to drop the column `additionalFields` on the `contents` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Filedtype" AS ENUM ('IMAGE', 'TEXT', 'VIDEO', 'QUOTE', 'AUDIO');

-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "additionalFields",
ALTER COLUMN "about" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."AdditionalFiled" (
    "id" TEXT NOT NULL,
    "indexfiled" TEXT NOT NULL,
    "filedtype" "public"."Filedtype" NOT NULL,

    CONSTRAINT "AdditionalFiled_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AdditionalFiledToContents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AdditionalFiledToContents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AdditionalFiledToContents_B_index" ON "public"."_AdditionalFiledToContents"("B");

-- AddForeignKey
ALTER TABLE "public"."_AdditionalFiledToContents" ADD CONSTRAINT "_AdditionalFiledToContents_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."AdditionalFiled"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AdditionalFiledToContents" ADD CONSTRAINT "_AdditionalFiledToContents_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
