/*
  Warnings:

  - A unique constraint covering the columns `[activityId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "activityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_activityId_key" ON "Notification"("activityId");
