/*
  Warnings:

  - You are about to drop the column `bookingId` on the `Schedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Schedule` DROP FOREIGN KEY `Schedule_bookingId_fkey`;

-- AlterTable
ALTER TABLE `Schedule` DROP COLUMN `bookingId`,
    ADD COLUMN `booking_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
