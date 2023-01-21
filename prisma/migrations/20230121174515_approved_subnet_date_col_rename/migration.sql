/*
  Warnings:

  - You are about to drop the column `created_at` on the `approved_subnet` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `approved_subnet` table. All the data in the column will be lost.
  - Added the required column `updated_date` to the `approved_subnet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "approved_subnet" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_date" TIMESTAMP(3) NOT NULL;
