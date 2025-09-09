-- CreateEnum
CREATE TYPE "public"."ApplyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."ApplytoContibute" (
    "id" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."ApplyStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,

    CONSTRAINT "ApplytoContibute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplytoContibute_email_key" ON "public"."ApplytoContibute"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApplytoContibute_userId_key" ON "public"."ApplytoContibute"("userId");

-- AddForeignKey
ALTER TABLE "public"."ApplytoContibute" ADD CONSTRAINT "ApplytoContibute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
