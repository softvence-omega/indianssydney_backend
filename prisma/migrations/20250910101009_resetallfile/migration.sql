-- CreateEnum
CREATE TYPE "public"."ApplyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('ARTICLE', 'PODCAST', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."ReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "public"."ContetReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('PENDING', 'APPROVE', 'Declined');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('contentStatus', 'LiveEvent', 'Shift', 'UserRolechange');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'MEMBER', 'CONTIBUTOR');

-- CreateTable
CREATE TABLE "public"."NotificationToggle" (
    "id" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "userUpdates" BOOLEAN NOT NULL DEFAULT false,
    "contentStatus" BOOLEAN NOT NULL DEFAULT false,
    "communication" BOOLEAN NOT NULL DEFAULT false,
    "surveyAndPoll" BOOLEAN NOT NULL DEFAULT false,
    "tasksAndProjects" BOOLEAN NOT NULL DEFAULT false,
    "scheduling" BOOLEAN NOT NULL DEFAULT false,
    "message" BOOLEAN NOT NULL DEFAULT false,
    "userRegistration" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "NotificationToggle_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."chooose-category" (
    "id" TEXT NOT NULL,
    "contenttype" "public"."ContentType" NOT NULL,
    "description" TEXT NOT NULL,
    "caticon" TEXT NOT NULL,

    CONSTRAINT "chooose-category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityPost" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "video" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communityPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostReaction" (
    "id" TEXT NOT NULL,
    "type" "public"."ReactionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "communityPostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentReaction" (
    "id" TEXT NOT NULL,
    "type" "public"."ReactionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contents" (
    "id" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT NOT NULL,
    "contentviews" INTEGER DEFAULT 0,
    "paragraph" TEXT,
    "shortQuote" TEXT,
    "image" TEXT,
    "videoFile" TEXT,
    "imageCaption" TEXT,
    "audioFile" TEXT,
    "tags" TEXT[],
    "videoThumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."additional_contents" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "type" TEXT,
    "value" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "additional_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "tamplate" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sub_categories" (
    "id" TEXT NOT NULL,
    "subname" TEXT,
    "subslug" TEXT,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentComment" (
    "id" TEXT NOT NULL,
    "contentcomment" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentReaction" (
    "id" TEXT NOT NULL,
    "type" "public"."ContetReactionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentCommentReaction" (
    "id" TEXT NOT NULL,
    "type" "public"."ContetReactionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentCommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."totalPageview" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "totalPageview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_instance" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LiveEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT NOT NULL,
    "thumbail" TEXT,
    "tags" TEXT[],
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "rtcToken" TEXT,
    "rtmToken" TEXT,
    "uid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" INTEGER,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "Price" INTEGER NOT NULL,
    "billingCycle" "public"."BillingCycle" NOT NULL,
    "shortBio" TEXT,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recommendation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportContent" (
    "id" TEXT NOT NULL,
    "contentTitle" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."screenshort_images" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screenshort_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscribe" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscribe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "password" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "profilePhoto" TEXT,
    "bio" TEXT,
    "googleId" TEXT,
    "emailOtp" INTEGER,
    "otpExpiry" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetOtp" INTEGER,
    "resetOtpExpiry" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isContibute" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionEndsAt" TIMESTAMP(3),
    "isMembership" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationToggle_userId_key" ON "public"."NotificationToggle"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplytoContibute_email_key" ON "public"."ApplytoContibute"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApplytoContibute_userId_key" ON "public"."ApplytoContibute"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_subname_key" ON "public"."sub_categories"("subname");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_subslug_key" ON "public"."sub_categories"("subslug");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_userId_notificationId_key" ON "public"."UserNotification"("userId", "notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_sessionId_key" ON "public"."payments"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_plans_name_key" ON "public"."payment_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscribe_email_key" ON "public"."subscribe"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "public"."users"("googleId");

-- AddForeignKey
ALTER TABLE "public"."NotificationToggle" ADD CONSTRAINT "NotificationToggle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplytoContibute" ADD CONSTRAINT "ApplytoContibute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityPost" ADD CONSTRAINT "CommunityPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_communityPostId_fkey" FOREIGN KEY ("communityPostId") REFERENCES "public"."CommunityPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostReaction" ADD CONSTRAINT "PostReaction_communityPostId_fkey" FOREIGN KEY ("communityPostId") REFERENCES "public"."CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReaction" ADD CONSTRAINT "CommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contents" ADD CONSTRAINT "contents_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."additional_contents" ADD CONSTRAINT "additional_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_categories" ADD CONSTRAINT "sub_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentComment" ADD CONSTRAINT "ContentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentComment" ADD CONSTRAINT "ContentComment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentReaction" ADD CONSTRAINT "ContentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentReaction" ADD CONSTRAINT "ContentReaction_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentCommentReaction" ADD CONSTRAINT "ContentCommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentCommentReaction" ADD CONSTRAINT "ContentCommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."ContentComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LiveEvent" ADD CONSTRAINT "LiveEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNotification" ADD CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recommendation" ADD CONSTRAINT "recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportContent" ADD CONSTRAINT "ReportContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."screenshort_images" ADD CONSTRAINT "screenshort_images_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."ReportContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
