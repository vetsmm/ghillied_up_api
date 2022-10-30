/*
  Warnings:

  - You are about to drop the column `public_file_id` on the `ghillie` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[public_image_id]` on the table `ghillie` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ghillie" DROP CONSTRAINT "ghillie_public_file_id_fkey";

-- DropIndex
DROP INDEX "ghillie_public_file_id_key";

-- AlterTable
ALTER TABLE "ghillie" DROP COLUMN "public_file_id",
ADD COLUMN     "public_image_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ghillie_public_image_id_key" ON "ghillie"("public_image_id");

-- AddForeignKey
ALTER TABLE "ghillie" ADD CONSTRAINT "ghillie_public_image_id_fkey" FOREIGN KEY ("public_image_id") REFERENCES "public_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
