/*
  Warnings:

  - A unique constraint covering the columns `[activityId]` on the table `PostBookmark` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PostBookmark" ADD COLUMN     "activityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PostBookmark_activityId_key" ON "PostBookmark"("activityId");
