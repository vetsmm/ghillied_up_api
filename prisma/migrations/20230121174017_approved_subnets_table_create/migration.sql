-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NONBINARY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MfaMethod" AS ENUM ('NONE', 'SMS', 'EMAIL');

-- CreateTable
CREATE TABLE "approved_subnet" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "subnet" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "timezone" TEXT,
    "country_code" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "approved_subnet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userId" ON "approved_subnet"("user_id");

-- AddForeignKey
ALTER TABLE "approved_subnet" ADD CONSTRAINT "approved_subnet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
