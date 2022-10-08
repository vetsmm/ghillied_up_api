/*
  Warnings:

  - A unique constraint covering the columns `[idMeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "idMeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_idMeId_key" ON "User"("idMeId");
