/*
  Warnings:

  - You are about to drop the column `billing_type` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `is_price_entry` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `billing_type`;

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `is_price_entry`,
    ADD COLUMN `billing_type` VARCHAR(191) NOT NULL DEFAULT 'one_time';
