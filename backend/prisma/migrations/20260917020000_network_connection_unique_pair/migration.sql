-- AlterTable
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_userAId_userBId_key" UNIQUE ("userAId", "userBId");
