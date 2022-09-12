/*
  Warnings:

  - You are about to drop the `_GhillieTopics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GhillieTopics" DROP CONSTRAINT "_GhillieTopics_A_fkey";

-- DropForeignKey
ALTER TABLE "_GhillieTopics" DROP CONSTRAINT "_GhillieTopics_B_fkey";

-- DropTable
DROP TABLE "_GhillieTopics";

-- CreateTable
CREATE TABLE "_GhillieToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GhillieToTopic_AB_unique" ON "_GhillieToTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_GhillieToTopic_B_index" ON "_GhillieToTopic"("B");

-- AddForeignKey
ALTER TABLE "_GhillieToTopic" ADD CONSTRAINT "_GhillieToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Ghillie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GhillieToTopic" ADD CONSTRAINT "_GhillieToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
