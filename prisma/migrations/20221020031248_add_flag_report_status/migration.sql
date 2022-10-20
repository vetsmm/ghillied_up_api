-- CreateEnum
CREATE TYPE "FlagReportStatus" AS ENUM ('NEW', 'INVESTIGATING', 'RESOLVED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "flag_comment" ADD COLUMN     "flag_report_status" "FlagReportStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "flag_ghillie" ADD COLUMN     "flag_report_status" "FlagReportStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "flag_post" ADD COLUMN     "flag_report_status" "FlagReportStatus" NOT NULL DEFAULT 'NEW';
