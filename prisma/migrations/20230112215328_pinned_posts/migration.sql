-- DropIndex
DROP INDEX "ghillie_name_slug_status_read_only_is_sponsored_is_promoted_idx";

-- DropIndex
DROP INDEX "post_title_status_uid_idx";

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "is_pinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ghillie_name_slug_status_read_only_is_sponsored_is_promoted_idx" ON "ghillie"("name", "slug", "status", "read_only", "is_sponsored", "is_promoted", "is_internal", "is_private", "category", "invite_code");

-- CreateIndex
CREATE INDEX "post_title_status_uid_is_pinned_idx" ON "post"("title", "status", "uid", "is_pinned");
