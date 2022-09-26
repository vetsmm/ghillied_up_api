-- CreateTable
CREATE TABLE "PushNotificationSettings" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "postReactions" BOOLEAN NOT NULL DEFAULT true,
    "postComments" BOOLEAN NOT NULL DEFAULT true,
    "commentReactions" BOOLEAN NOT NULL DEFAULT true,
    "postActivity" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PushNotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushNotificationSettings_userId_key" ON "PushNotificationSettings"("userId");

-- AddForeignKey
ALTER TABLE "PushNotificationSettings" ADD CONSTRAINT "PushNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
