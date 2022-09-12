/*
  Warnings:

  - The `activationCode` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `resetKey` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activationCodeSentAt" TIMESTAMP(3),
DROP COLUMN "activationCode",
ADD COLUMN     "activationCode" INTEGER,
DROP COLUMN "resetKey",
ADD COLUMN     "resetKey" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_activationCode_key" ON "User"("activationCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetKey_key" ON "User"("resetKey");
