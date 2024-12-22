/*
  Warnings:

  - You are about to drop the column `roleName` on the `Roles` table. All the data in the column will be lost.
  - You are about to drop the `Likes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_getLikeId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_putLikeId_fkey";

-- DropIndex
DROP INDEX "Roles_roleName_key";

-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "updated" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "image" TEXT,
ADD COLUMN     "updated" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "Roles" DROP COLUMN "roleName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "accountImg" TEXT,
ADD COLUMN     "lastLogIn" TIMESTAMP(6);

-- DropTable
DROP TABLE "Likes";

-- CreateIndex
CREATE UNIQUE INDEX "Roles_roleName_key" ON "Roles"("name");
