-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COMMENT', 'REPLY', 'REACTION');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "trash" BOOLEAN NOT NULL DEFAULT false,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3) NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_createdDate_type_read_trash_idx" ON "Notification"("createdDate", "type", "read", "trash");

-- CreateIndex
CREATE INDEX "CommentReaction_reactionType_idx" ON "CommentReaction"("reactionType");

-- CreateIndex
CREATE INDEX "FlagComment_category_idx" ON "FlagComment"("category");

-- CreateIndex
CREATE INDEX "FlagGhillie_category_idx" ON "FlagGhillie"("category");

-- CreateIndex
CREATE INDEX "FlagPost_category_idx" ON "FlagPost"("category");

-- CreateIndex
CREATE INDEX "Ghillie_name_slug_status_readOnly_idx" ON "Ghillie"("name", "slug", "status", "readOnly");

-- CreateIndex
CREATE INDEX "GhillieMembers_memberStatus_role_idx" ON "GhillieMembers"("memberStatus", "role");

-- CreateIndex
CREATE INDEX "Post_title_status_uid_idx" ON "Post"("title", "status", "uid");

-- CreateIndex
CREATE INDEX "PostComment_status_commentHeight_idx" ON "PostComment"("status", "commentHeight");

-- CreateIndex
CREATE INDEX "PostReaction_reactionType_idx" ON "PostReaction"("reactionType");

-- CreateIndex
CREATE INDEX "PostTag_name_idx" ON "PostTag"("name");

-- CreateIndex
CREATE INDEX "Topic_name_slug_idx" ON "Topic"("name", "slug");

-- CreateIndex
CREATE INDEX "User_email_username_slug_idx" ON "User"("email", "username", "slug");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
