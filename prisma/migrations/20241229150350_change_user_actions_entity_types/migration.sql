/*
  Warnings:

  - Changed the type of `action` on the `User_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entityType` on the `User_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User_actions" DROP COLUMN "action",
ADD COLUMN "action" TEXT NOT NULL,
DROP COLUMN "entityType",
ADD COLUMN "entityType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Action";

-- DropEnum
DROP TYPE "EntityType";
