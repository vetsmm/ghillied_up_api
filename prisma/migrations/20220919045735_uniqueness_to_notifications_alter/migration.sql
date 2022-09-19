/*
  Warnings:

  - A unique constraint covering the columns `[type,sourceId,fromUserId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Notification_type_sourceId_fromUserId_key" ON "Notification"("type", "sourceId", "fromUserId");
