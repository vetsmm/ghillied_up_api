-- DropForeignKey
ALTER TABLE "ghillie" DROP CONSTRAINT "ghillie_public_image_id_fkey";

-- AddForeignKey
ALTER TABLE "ghillie" ADD CONSTRAINT "ghillie_public_image_id_fkey" FOREIGN KEY ("public_image_id") REFERENCES "public_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
