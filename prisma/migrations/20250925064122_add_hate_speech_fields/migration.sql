-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "hate_speech_detect" BOOLEAN;
