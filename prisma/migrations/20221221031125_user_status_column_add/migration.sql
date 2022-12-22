-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED');

-- DropForeignKey
ALTER TABLE "flag_ghillie" DROP CONSTRAINT "flag_ghillie_ghillie_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE "flag_ghillie" ADD CONSTRAINT "flag_ghillie_ghillie_id_fkey" FOREIGN KEY ("ghillie_id") REFERENCES "ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
