/*
  Warnings:

  - A unique constraint covering the columns `[userId,juz,surahId]` on the table `ReadingProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ReadingProgress" ADD COLUMN     "surahId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_userId_juz_surahId_key" ON "ReadingProgress"("userId", "juz", "surahId");
