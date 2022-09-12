/*
  Warnings:

  - You are about to drop the column `createdByUsername` on the `CommentReaction` table. All the data in the column will be lost.
  - You are about to drop the column `postedByUsername` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `createdByUsername` on the `PostComment` table. All the data in the column will be lost.
  - You are about to drop the column `createdByUsername` on the `PostReaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[createdById,commentId]` on the table `CommentReaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdById,postId]` on the table `PostReaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `CommentReaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postedById` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `PostComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `PostReaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CommentReaction" DROP CONSTRAINT "CommentReaction_createdByUsername_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_postedByUsername_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_createdByUsername_fkey";

-- DropForeignKey
ALTER TABLE "PostReaction" DROP CONSTRAINT "PostReaction_createdByUsername_fkey";

-- DropIndex
DROP INDEX "CommentReaction_createdByUsername_commentId_key";

-- DropIndex
DROP INDEX "PostReaction_createdByUsername_postId_key";

-- AlterTable
ALTER TABLE "CommentReaction" DROP COLUMN "createdByUsername",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "postedByUsername",
ADD COLUMN     "postedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PostComment" DROP COLUMN "createdByUsername",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PostReaction" DROP COLUMN "createdByUsername",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_createdById_commentId_key" ON "CommentReaction"("createdById", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_createdById_postId_key" ON "PostReaction"("createdById", "postId");

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
