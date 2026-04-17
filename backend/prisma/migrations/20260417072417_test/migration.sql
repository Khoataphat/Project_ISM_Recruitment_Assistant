/*
  Warnings:

  - You are about to drop the column `VerificationCode` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `VerificationExp` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "VerificationCode",
DROP COLUMN "VerificationExp";
