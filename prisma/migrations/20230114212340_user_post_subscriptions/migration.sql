-- CreateTable
CREATE TABLE "post_subscribed_user" (
    "id" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "post_subscribed_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_subscribed_user_post_id_user_id_key" ON "post_subscribed_user"("post_id", "user_id");

-- AddForeignKey
ALTER TABLE "post_subscribed_user" ADD CONSTRAINT "post_subscribed_user_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_subscribed_user" ADD CONSTRAINT "post_subscribed_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
