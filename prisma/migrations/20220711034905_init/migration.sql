-- CreateEnum
CREATE TYPE "UserAuthority" AS ENUM ('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('VETERAN', 'ACTIVE_DUTY', 'RESERVE', 'UNKNOWN', 'NATIONAL_GUARD', 'CIVILIAN');

-- CreateEnum
CREATE TYPE "ServiceBranch" AS ENUM ('ARMY', 'ARMY_NATIONAL_GUARD', 'AIR_FORCE', 'AIR_NATIONAL_GUARD', 'MARINES', 'NAVY', 'SPACE_FORCE', 'UNKNOWN', 'NO_SERVICE');

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

-- CreateTable
CREATE TABLE "CommentReaction" (
    "id" TEXT NOT NULL,
    "reactionType" "ReactionType" NOT NULL,
    "createdByUsername" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlagComment" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "postCommentId" TEXT NOT NULL,
    "category" "FlagCategory" NOT NULL DEFAULT 'OTHER',
    "creadtedByUserId" TEXT NOT NULL,

    CONSTRAINT "FlagComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3) NOT NULL,
    "createdByUsername" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "childCommentIds" TEXT[],

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" TEXT NOT NULL,
    "reactionType" "ReactionType" NOT NULL,
    "createdByUsername" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlagPost" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "postId" TEXT NOT NULL,
    "category" "FlagCategory" NOT NULL DEFAULT 'OTHER',
    "creadtedByUserId" TEXT NOT NULL,

    CONSTRAINT "FlagPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'ACTIVE',
    "ghillieId" TEXT NOT NULL,
    "postedByUsername" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlagGhillie" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "ghillieId" TEXT NOT NULL,
    "category" "FlagCategory" NOT NULL DEFAULT 'OTHER',
    "creadtedByUserId" TEXT NOT NULL,
    "ghillieMembersUserId" TEXT,
    "ghillieMembersGhillieId" TEXT,

    CONSTRAINT "FlagGhillie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GhillieMembers" (
    "userId" TEXT NOT NULL,
    "ghillieId" TEXT NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberStatus" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "GhillieRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "GhillieMembers_pkey" PRIMARY KEY ("userId","ghillieId")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ghillie" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "about" TEXT,
    "status" "GhillieStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "readOnly" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,

    CONSTRAINT "Ghillie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "branch" "ServiceBranch" DEFAULT 'UNKNOWN',
    "serviceStatus" "ServiceStatus" DEFAULT 'UNKNOWN',
    "isVerifiedMilitary" BOOLEAN NOT NULL DEFAULT false,
    "serviceEntryDate" TIMESTAMP(3),
    "serviceExitDate" TIMESTAMP(3),
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "activationCode" TEXT,
    "resetKey" TEXT NOT NULL,
    "resetDate" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "imageUrl" TEXT,
    "password" TEXT NOT NULL,
    "authorities" "UserAuthority"[] DEFAULT ARRAY['ROLE_USER']::"UserAuthority"[],
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostToPostTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GhillieTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_createdByUsername_commentId_key" ON "CommentReaction"("createdByUsername", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagComment_postCommentId_creadtedByUserId_key" ON "FlagComment"("postCommentId", "creadtedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_createdByUsername_postId_key" ON "PostReaction"("createdByUsername", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTag_name_key" ON "PostTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FlagPost_postId_creadtedByUserId_key" ON "FlagPost"("postId", "creadtedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_uid_key" ON "Post"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "FlagGhillie_ghillieId_creadtedByUserId_key" ON "FlagGhillie"("ghillieId", "creadtedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ghillie_name_key" ON "Ghillie"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ghillie_slug_key" ON "Ghillie"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_activationCode_key" ON "User"("activationCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetKey_key" ON "User"("resetKey");

-- CreateIndex
CREATE UNIQUE INDEX "_PostToPostTag_AB_unique" ON "_PostToPostTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PostToPostTag_B_index" ON "_PostToPostTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GhillieTopics_AB_unique" ON "_GhillieTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_GhillieTopics_B_index" ON "_GhillieTopics"("B");

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_createdByUsername_fkey" FOREIGN KEY ("createdByUsername") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagComment" ADD CONSTRAINT "FlagComment_postCommentId_fkey" FOREIGN KEY ("postCommentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagComment" ADD CONSTRAINT "FlagComment_creadtedByUserId_fkey" FOREIGN KEY ("creadtedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_createdByUsername_fkey" FOREIGN KEY ("createdByUsername") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_createdByUsername_fkey" FOREIGN KEY ("createdByUsername") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagPost" ADD CONSTRAINT "FlagPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagPost" ADD CONSTRAINT "FlagPost_creadtedByUserId_fkey" FOREIGN KEY ("creadtedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_ghillieId_fkey" FOREIGN KEY ("ghillieId") REFERENCES "Ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_postedByUsername_fkey" FOREIGN KEY ("postedByUsername") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagGhillie" ADD CONSTRAINT "FlagGhillie_ghillieMembersUserId_ghillieMembersGhillieId_fkey" FOREIGN KEY ("ghillieMembersUserId", "ghillieMembersGhillieId") REFERENCES "GhillieMembers"("userId", "ghillieId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagGhillie" ADD CONSTRAINT "FlagGhillie_ghillieId_fkey" FOREIGN KEY ("ghillieId") REFERENCES "Ghillie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagGhillie" ADD CONSTRAINT "FlagGhillie_creadtedByUserId_fkey" FOREIGN KEY ("creadtedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhillieMembers" ADD CONSTRAINT "GhillieMembers_ghillieId_fkey" FOREIGN KEY ("ghillieId") REFERENCES "Ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhillieMembers" ADD CONSTRAINT "GhillieMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ghillie" ADD CONSTRAINT "Ghillie_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToPostTag" ADD CONSTRAINT "_PostToPostTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToPostTag" ADD CONSTRAINT "_PostToPostTag_B_fkey" FOREIGN KEY ("B") REFERENCES "PostTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GhillieTopics" ADD CONSTRAINT "_GhillieTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "Ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GhillieTopics" ADD CONSTRAINT "_GhillieTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
