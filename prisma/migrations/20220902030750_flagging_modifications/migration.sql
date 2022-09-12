/*
  Warnings:

  - You are about to drop the column `creadtedByUserId` on the `FlagComment` table. All the data in the column will be lost.
  - You are about to drop the column `creadtedByUserId` on the `FlagGhillie` table. All the data in the column will be lost.
  - You are about to drop the column `ghillieMembersGhillieId` on the `FlagGhillie` table. All the data in the column will be lost.
  - You are about to drop the column `ghillieMembersUserId` on the `FlagGhillie` table. All the data in the column will be lost.
  - You are about to drop the column `creadtedByUserId` on the `FlagPost` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[postCommentId,createdByUserId]` on the table `FlagComment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ghillieId,createdByUserId]` on the table `FlagGhillie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId,createdByUserId]` on the table `FlagPost` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdByUserId` to the `FlagComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `FlagGhillie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `FlagPost` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FlagComment" DROP CONSTRAINT "FlagComment_creadtedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "FlagGhillie" DROP CONSTRAINT "FlagGhillie_creadtedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "FlagGhillie" DROP CONSTRAINT "FlagGhillie_ghillieMembersUserId_ghillieMembersGhillieId_fkey";

-- DropForeignKey
ALTER TABLE "FlagPost" DROP CONSTRAINT "FlagPost_creadtedByUserId_fkey";

-- DropIndex
DROP INDEX "FlagComment_postCommentId_creadtedByUserId_key";

-- DropIndex
DROP INDEX "FlagGhillie_ghillieId_creadtedByUserId_key";

-- DropIndex
DROP INDEX "FlagPost_postId_creadtedByUserId_key";

-- AlterTable
ALTER TABLE "FlagComment" DROP COLUMN "creadtedByUserId",
ADD COLUMN     "createdByUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FlagGhillie" DROP COLUMN "creadtedByUserId",
DROP COLUMN "ghillieMembersGhillieId",
DROP COLUMN "ghillieMembersUserId",
ADD COLUMN     "createdByUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FlagPost" DROP COLUMN "creadtedByUserId",
ADD COLUMN     "createdByUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FlagComment_postCommentId_createdByUserId_key" ON "FlagComment"("postCommentId", "createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagGhillie_ghillieId_createdByUserId_key" ON "FlagGhillie"("ghillieId", "createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagPost_postId_createdByUserId_key" ON "FlagPost"("postId", "createdByUserId");

-- AddForeignKey
ALTER TABLE "FlagComment" ADD CONSTRAINT "FlagComment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagPost" ADD CONSTRAINT "FlagPost_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagGhillie" ADD CONSTRAINT "FlagGhillie_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
