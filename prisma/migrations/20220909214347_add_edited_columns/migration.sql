-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "edited" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "edited" BOOLEAN NOT NULL DEFAULT false;
