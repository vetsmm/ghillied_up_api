-- CreateEnum
CREATE TYPE "PhonePlatform" AS ENUM ('ANDROID', 'IOS');

-- CreateEnum
CREATE TYPE "UserAuthority" AS ENUM ('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_VERIFIED_MILITARY');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('VETERAN', 'ACTIVE_DUTY', 'RESERVE', 'UNKNOWN', 'NATIONAL_GUARD', 'CIVILIAN');

-- CreateEnum
CREATE TYPE "ServiceBranch" AS ENUM ('ARMY', 'ARMY_NATIONAL_GUARD', 'AIR_FORCE', 'AIR_NATIONAL_GUARD', 'MARINES', 'NAVY', 'SPACE_FORCE', 'UNKNOWN', 'NO_SERVICE', 'COAST_GUARD');

-- CreateEnum
CREATE TYPE "RankingAuthority" AS ENUM ('ENLISTED', 'WARRANT_OFFICER', 'COMMISSIONED_OFFICER');

-- CreateEnum
CREATE TYPE "MilitaryGrade" AS ENUM ('E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'SENIOR_ENLISTED_ADVISOR', 'W1', 'W2', 'W3', 'W4', 'W5', 'O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8', 'O9', 'O10', 'SPECIAL');

-- CreateEnum
CREATE TYPE "GhillieStatus" AS ENUM ('ACTIVE', 'DISABLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'REMOVED');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'REMOVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FlagCategory" AS ENUM ('HARRASSMENT', 'RACISM', 'OPSEC', 'SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "GhillieRole" AS ENUM ('MEMBER', 'MODERATOR', 'OWNER');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('THUMBS_UP', 'LAUGH', 'SMART', 'CURIOUS', 'ANGRY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('POST_COMMENT', 'POST', 'POST_REACTION', 'POST_COMMENT_REACTION');

-- CreateTable
CREATE TABLE "comment_reaction" (
    "id" TEXT NOT NULL,
    "reaction_type" "ReactionType" NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "activity_id" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_comment" (
    "id" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "post_comment_id" TEXT NOT NULL,
    "category" "FlagCategory" NOT NULL DEFAULT 'OTHER',
    "created_by_user_id" TEXT NOT NULL,
    "activity_id" TEXT,

    CONSTRAINT "flag_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "comment_height" INTEGER NOT NULL DEFAULT 0,
    "child_comment_ids" TEXT[],
    "activity_id" TEXT,

    CONSTRAINT "post_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reaction" (
    "id" TEXT NOT NULL,
    "reaction_type" "ReactionType" NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "activity_id" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_post" (
    "id" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "post_id" TEXT NOT NULL,
    "category" "FlagCategory" NOT NULL DEFAULT 'OTHER',
    "created_by_user_id" TEXT NOT NULL,
    "activity_id" TEXT,

    CONSTRAINT "flag_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_bookmark" (
    "id" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_id" TEXT,

    CONSTRAINT "post_bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'ACTIVE',
    "ghillie_id" TEXT NOT NULL,
    "posted_by_id" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "activity_id" TEXT,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_ghillie" (
    "id" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "ghillie_id" TEXT NOT NULL,
    "category" "FlagCategory" NOT NULL DEFAULT 'OTHER',
    "created_by_user_id" TEXT NOT NULL,
    "activity_id" TEXT,

    CONSTRAINT "flag_ghillie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ghillie_members" (
    "user_id" TEXT NOT NULL,
    "ghillie_id" TEXT NOT NULL,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "member_status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "GhillieRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "ghillie_members_pkey" PRIMARY KEY ("user_id","ghillie_id")
);

-- CreateTable
CREATE TABLE "topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "created_by_user_id" TEXT NOT NULL,

    CONSTRAINT "topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ghillie" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "about" TEXT,
    "status" "GhillieStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "read_only" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,

    CONSTRAINT "ghillie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "branch" "ServiceBranch" DEFAULT 'UNKNOWN',
    "service_status" "ServiceStatus" DEFAULT 'UNKNOWN',
    "is_verified_military" BOOLEAN NOT NULL DEFAULT false,
    "service_entry_date" TIMESTAMP(3),
    "service_exit_date" TIMESTAMP(3),
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "activation_code" INTEGER,
    "activation_code_sent_at" TIMESTAMP(3),
    "reset_key" INTEGER,
    "reset_date" TIMESTAMP(3),
    "idme_id" TEXT,
    "last_login_at" TIMESTAMP(3),
    "image_url" TEXT,
    "password" TEXT NOT NULL,
    "authorities" "UserAuthority"[] DEFAULT ARRAY['ROLE_USER']::"UserAuthority"[],
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "trash" BOOLEAN NOT NULL DEFAULT false,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "from_user_id" TEXT,
    "to_user_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "activity_id" TEXT,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notification_settings" (
    "id" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_reactions" BOOLEAN NOT NULL DEFAULT true,
    "post_comments" BOOLEAN NOT NULL DEFAULT true,
    "comment_reactions" BOOLEAN NOT NULL DEFAULT true,
    "post_activity" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "push_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_push_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" "PhonePlatform" NOT NULL,

    CONSTRAINT "device_push_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostToPostTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GhillieToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "comment_reaction_activity_id_key" ON "comment_reaction"("activity_id");

-- CreateIndex
CREATE INDEX "comment_reaction_reaction_type_idx" ON "comment_reaction"("reaction_type");

-- CreateIndex
CREATE UNIQUE INDEX "comment_reaction_created_by_id_comment_id_key" ON "comment_reaction"("created_by_id", "comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "flag_comment_activity_id_key" ON "flag_comment"("activity_id");

-- CreateIndex
CREATE INDEX "flag_comment_category_idx" ON "flag_comment"("category");

-- CreateIndex
CREATE UNIQUE INDEX "flag_comment_post_comment_id_created_by_user_id_key" ON "flag_comment"("post_comment_id", "created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_comment_activity_id_key" ON "post_comment"("activity_id");

-- CreateIndex
CREATE INDEX "post_comment_status_comment_height_idx" ON "post_comment"("status", "comment_height");

-- CreateIndex
CREATE UNIQUE INDEX "post_reaction_activity_id_key" ON "post_reaction"("activity_id");

-- CreateIndex
CREATE INDEX "post_reaction_reaction_type_idx" ON "post_reaction"("reaction_type");

-- CreateIndex
CREATE UNIQUE INDEX "post_reaction_created_by_id_post_id_key" ON "post_reaction"("created_by_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_tag_name_key" ON "post_tag"("name");

-- CreateIndex
CREATE INDEX "post_tag_name_idx" ON "post_tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "flag_post_activity_id_key" ON "flag_post"("activity_id");

-- CreateIndex
CREATE INDEX "flag_post_category_idx" ON "flag_post"("category");

-- CreateIndex
CREATE UNIQUE INDEX "flag_post_post_id_created_by_user_id_key" ON "flag_post"("post_id", "created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_bookmark_activity_id_key" ON "post_bookmark"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_bookmark_post_id_user_id_key" ON "post_bookmark"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_uid_key" ON "post"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "post_activity_id_key" ON "post"("activity_id");

-- CreateIndex
CREATE INDEX "post_title_status_uid_idx" ON "post"("title", "status", "uid");

-- CreateIndex
CREATE UNIQUE INDEX "flag_ghillie_activity_id_key" ON "flag_ghillie"("activity_id");

-- CreateIndex
CREATE INDEX "flag_ghillie_category_idx" ON "flag_ghillie"("category");

-- CreateIndex
CREATE UNIQUE INDEX "flag_ghillie_ghillie_id_created_by_user_id_key" ON "flag_ghillie"("ghillie_id", "created_by_user_id");

-- CreateIndex
CREATE INDEX "ghillie_members_member_status_role_idx" ON "ghillie_members"("member_status", "role");

-- CreateIndex
CREATE UNIQUE INDEX "topic_name_key" ON "topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "topic_slug_key" ON "topic"("slug");

-- CreateIndex
CREATE INDEX "topic_name_slug_idx" ON "topic"("name", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ghillie_name_key" ON "ghillie"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ghillie_slug_key" ON "ghillie"("slug");

-- CreateIndex
CREATE INDEX "ghillie_name_slug_status_read_only_idx" ON "ghillie"("name", "slug", "status", "read_only");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_slug_key" ON "user"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_activation_code_key" ON "user"("activation_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_reset_key_key" ON "user"("reset_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_idme_id_key" ON "user"("idme_id");

-- CreateIndex
CREATE INDEX "user_email_username_slug_idx" ON "user"("email", "username", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "notification_activity_id_key" ON "notification"("activity_id");

-- CreateIndex
CREATE INDEX "notification_created_date_type_read_trash_idx" ON "notification"("created_date", "type", "read", "trash");

-- CreateIndex
CREATE UNIQUE INDEX "notification_type_source_id_from_user_id_key" ON "notification"("type", "source_id", "from_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_notification_settings_user_id_key" ON "push_notification_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_push_token_token_user_id_key" ON "device_push_token"("token", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_PostToPostTag_AB_unique" ON "_PostToPostTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PostToPostTag_B_index" ON "_PostToPostTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GhillieToTopic_AB_unique" ON "_GhillieToTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_GhillieToTopic_B_index" ON "_GhillieToTopic"("B");

-- AddForeignKey
ALTER TABLE "comment_reaction" ADD CONSTRAINT "comment_reaction_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reaction" ADD CONSTRAINT "comment_reaction_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "post_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_comment" ADD CONSTRAINT "flag_comment_post_comment_id_fkey" FOREIGN KEY ("post_comment_id") REFERENCES "post_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_comment" ADD CONSTRAINT "flag_comment_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reaction" ADD CONSTRAINT "post_reaction_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reaction" ADD CONSTRAINT "post_reaction_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_post" ADD CONSTRAINT "flag_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_post" ADD CONSTRAINT "flag_post_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_bookmark" ADD CONSTRAINT "post_bookmark_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_bookmark" ADD CONSTRAINT "post_bookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_ghillie_id_fkey" FOREIGN KEY ("ghillie_id") REFERENCES "ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_posted_by_id_fkey" FOREIGN KEY ("posted_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_ghillie" ADD CONSTRAINT "flag_ghillie_ghillie_id_fkey" FOREIGN KEY ("ghillie_id") REFERENCES "ghillie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_ghillie" ADD CONSTRAINT "flag_ghillie_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ghillie_members" ADD CONSTRAINT "ghillie_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ghillie_members" ADD CONSTRAINT "ghillie_members_ghillie_id_fkey" FOREIGN KEY ("ghillie_id") REFERENCES "ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ghillie" ADD CONSTRAINT "ghillie_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notification_settings" ADD CONSTRAINT "push_notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_push_token" ADD CONSTRAINT "device_push_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToPostTag" ADD CONSTRAINT "_PostToPostTag_A_fkey" FOREIGN KEY ("A") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToPostTag" ADD CONSTRAINT "_PostToPostTag_B_fkey" FOREIGN KEY ("B") REFERENCES "post_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GhillieToTopic" ADD CONSTRAINT "_GhillieToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GhillieToTopic" ADD CONSTRAINT "_GhillieToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
