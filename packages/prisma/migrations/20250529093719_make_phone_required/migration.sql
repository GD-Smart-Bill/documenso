/*
  Warnings:

  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/

-- First, update existing NULL phone values with empty string
UPDATE "User" SET "phone" = '' WHERE "phone" IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;
