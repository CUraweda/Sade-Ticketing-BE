/*
  Warnings:

  - You are about to drop the column `expired_at` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `group_label` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `is_approved` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `max_bookings` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `expired_at`,
    DROP COLUMN `group_label`,
    DROP COLUMN `is_approved`,
    ADD COLUMN `billing_type` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `max_bookings`;
