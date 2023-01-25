/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "two_factor_method" "MfaMethod" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "two_factor_secret" TEXT;

-- CreateTable
CREATE TABLE "backup_code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "backup_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "backup_code_user_id_idx" ON "backup_code"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");

-- AddForeignKey
ALTER TABLE "backup_code" ADD CONSTRAINT "backup_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
