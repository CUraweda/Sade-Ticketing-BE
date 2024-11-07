/*
  Warnings:

  - You are about to drop the column `max_participants` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Service` DROP COLUMN `max_participants`,
    ADD COLUMN `max_clients` INTEGER NOT NULL DEFAULT 1;
