/*
  Warnings:

  - You are about to drop the column `receiver` on the `Balance` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `Balance` table. All the data in the column will be lost.
  - Added the required column `holder` to the `Balance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Balance` DROP COLUMN `receiver`,
    DROP COLUMN `sender`,
    ADD COLUMN `holder` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` ENUM('IN', 'OUT') NOT NULL;
