-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REPORTER', 'ADMIN');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'REPORTER';
