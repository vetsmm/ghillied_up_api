-- AlterTable
ALTER TABLE "user" ADD COLUMN     "check_location_on_login" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/New_York';

-- CreateTable
CREATE TABLE "session" (
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "user_agent" TEXT,
    "city" TEXT,
    "region" TEXT,
    "timezone" TEXT,
    "country_code" TEXT,
    "browser" TEXT,
    "operating_system" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
