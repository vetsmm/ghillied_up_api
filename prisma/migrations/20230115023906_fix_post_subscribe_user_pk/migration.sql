/*
  Warnings:

  - The primary key for the `post_subscribed_user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `post_subscribed_user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "post_subscribed_user_post_id_user_id_key";

-- AlterTable
ALTER TABLE "post_subscribed_user" DROP CONSTRAINT "post_subscribed_user_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "post_subscribed_user_pkey" PRIMARY KEY ("user_id", "post_id");
