/*
  Warnings:

  - A unique constraint covering the columns `[invite_code]` on the table `ghillie` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GhillieCategory" AS ENUM ('UNIT', 'BASE', 'SOCIAL', 'COMPANY', 'INDUSTRY', 'CUSTOM', 'EDUCATIONAL');

-- DropIndex
DROP INDEX "ghillie_name_slug_status_read_only_idx";

-- AlterTable
ALTER TABLE "ghillie" ADD COLUMN     "admin_invite_only" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" "GhillieCategory" NOT NULL DEFAULT 'CUSTOM',
ADD COLUMN     "invite_code" TEXT,
ADD COLUMN     "is_internal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_private" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_promoted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_sponsored" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "promoted_ghillies" (
    "id" TEXT NOT NULL,
    "ghillie_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promoted_ghillies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsored_ghillies" (
    "id" TEXT NOT NULL,
    "ghillie_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsored_ghillies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promoted_ghillies_ghillie_id_key" ON "promoted_ghillies"("ghillie_id");

-- CreateIndex
CREATE UNIQUE INDEX "sponsored_ghillies_ghillie_id_key" ON "sponsored_ghillies"("ghillie_id");

-- CreateIndex
CREATE UNIQUE INDEX "ghillie_invite_code_key" ON "ghillie"("invite_code");

-- CreateIndex
CREATE INDEX "ghillie_name_slug_status_read_only_is_sponsored_is_promoted_idx" ON "ghillie"("name", "slug", "status", "read_only", "is_sponsored", "is_promoted", "is_internal", "is_private", "category");

-- AddForeignKey
ALTER TABLE "promoted_ghillies" ADD CONSTRAINT "promoted_ghillies_ghillie_id_fkey" FOREIGN KEY ("ghillie_id") REFERENCES "ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_ghillies" ADD CONSTRAINT "sponsored_ghillies_ghillie_id_fkey" FOREIGN KEY ("ghillie_id") REFERENCES "ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
