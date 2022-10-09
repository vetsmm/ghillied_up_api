/*
  Warnings:

  - A unique constraint covering the columns `[token,userId]` on the table `DevicePushToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DevicePushToken_token_idx";

-- CreateIndex
CREATE UNIQUE INDEX "DevicePushToken_token_userId_key" ON "DevicePushToken"("token", "userId");
