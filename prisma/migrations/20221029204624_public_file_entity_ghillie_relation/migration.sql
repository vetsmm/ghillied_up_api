/*
  Warnings:

  - A unique constraint covering the columns `[public_file_id]` on the table `ghillie` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ghillie" ADD COLUMN     "public_file_id" TEXT;

-- CreateTable
CREATE TABLE "public_file" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ghillie_public_file_id_key" ON "ghillie"("public_file_id");

-- AddForeignKey
ALTER TABLE "ghillie" ADD CONSTRAINT "ghillie_public_file_id_fkey" FOREIGN KEY ("public_file_id") REFERENCES "public_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
