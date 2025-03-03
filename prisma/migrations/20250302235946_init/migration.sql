-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'belum_dibaca';

-- AlterTable
ALTER TABLE "ReadingProgress" ADD COLUMN     "catatan" TEXT;
