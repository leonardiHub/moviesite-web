/*
  Warnings:

  - You are about to drop the column `languages` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the `languages` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movies" DROP COLUMN "languages";

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "code" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing tags to have a default code based on their name
UPDATE "tags" SET "code" = UPPER(SUBSTRING("name", 1, 4)) WHERE "code" IS NULL;

-- Make code column NOT NULL after populating it
ALTER TABLE "tags" ALTER COLUMN "code" SET NOT NULL;

-- DropTable
DROP TABLE "languages";

-- CreateIndex
CREATE UNIQUE INDEX "tags_code_key" ON "tags"("code");
