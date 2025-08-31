/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `admin_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `admin_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");
