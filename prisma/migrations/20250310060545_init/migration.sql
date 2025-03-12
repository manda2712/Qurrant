/*
  Warnings:

  - You are about to drop the column `surahId` on the `ReadingProgress` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ReadingProgress_userId_juz_surahId_key";

-- AlterTable
ALTER TABLE "ReadingProgress" DROP COLUMN "surahId";
