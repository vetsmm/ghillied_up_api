/*
  Warnings:

  - A unique constraint covering the columns `[activityId]` on the table `CommentReaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityId]` on the table `PostComment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityId]` on the table `PostReaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CommentReaction" ADD COLUMN     "activityId" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "activityId" TEXT;

-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "activityId" TEXT;

-- AlterTable
ALTER TABLE "PostReaction" ADD COLUMN     "activityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_activityId_key" ON "CommentReaction"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_activityId_key" ON "Post"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "PostComment_activityId_key" ON "PostComment"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_activityId_key" ON "PostReaction"("activityId");
