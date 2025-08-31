/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `genres` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `genres` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `genres` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `people` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "genres" ADD COLUMN     "code" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- Update existing genres to have a default code based on their name
UPDATE "genres" SET "code" = UPPER(SUBSTRING("name", 1, 4)) WHERE "code" IS NULL;

-- Make code column NOT NULL after populating it
ALTER TABLE "genres" ALTER COLUMN "code" SET NOT NULL;

-- Update existing genres to have current timestamp for updated_at
UPDATE "genres" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

-- Make updated_at column NOT NULL after populating it
ALTER TABLE "genres" ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "people" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- Update existing people to have current timestamp for updated_at
UPDATE "people" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

-- Make updated_at column NOT NULL after populating it
ALTER TABLE "people" ALTER COLUMN "updated_at" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "genres_code_key" ON "genres"("code");
