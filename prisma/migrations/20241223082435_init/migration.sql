-- CreateEnum
CREATE TYPE "Action" AS ENUM ('Create', 'Update', 'Delete', 'Viewed', 'Followed', 'NewFollower');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('User', 'Post', 'Comment', 'PostLike', 'CommentLike');

-- CreateTable
CREATE TABLE "Follows" (
    "id" SERIAL NOT NULL,
    "followedById" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,
    "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_actions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" "Action" NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" INTEGER NOT NULL,
    "entity" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_actions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followedById_fkey" FOREIGN KEY ("followedById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_actions" ADD CONSTRAINT "User_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
