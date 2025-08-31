-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "cast" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "director" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION;
