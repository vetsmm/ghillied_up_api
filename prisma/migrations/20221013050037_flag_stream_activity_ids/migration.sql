/*
  Warnings:

  - A unique constraint covering the columns `[activityId]` on the table `FlagComment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityId]` on the table `FlagGhillie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityId]` on the table `FlagPost` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FlagComment" ADD COLUMN     "activityId" TEXT;

-- AlterTable
ALTER TABLE "FlagGhillie" ADD COLUMN     "activityId" TEXT;

-- AlterTable
ALTER TABLE "FlagPost" ADD COLUMN     "activityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FlagComment_activityId_key" ON "FlagComment"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagGhillie_activityId_key" ON "FlagGhillie"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagPost_activityId_key" ON "FlagPost"("activityId");
