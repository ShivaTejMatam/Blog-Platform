-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
