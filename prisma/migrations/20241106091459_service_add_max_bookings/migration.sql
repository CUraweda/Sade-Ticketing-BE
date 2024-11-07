/*
  Warnings:

  - You are about to drop the column `booking_id` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `max_clients` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Schedule` DROP FOREIGN KEY `Schedule_booking_id_fkey`;

-- AlterTable
ALTER TABLE `Schedule` DROP COLUMN `booking_id`;

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `max_clients`,
    ADD COLUMN `max_bookings` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `_BookingToSchedule` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_BookingToSchedule_AB_unique`(`A`, `B`),
    INDEX `_BookingToSchedule_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_BookingToSchedule` ADD CONSTRAINT `_BookingToSchedule_A_fkey` FOREIGN KEY (`A`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BookingToSchedule` ADD CONSTRAINT `_BookingToSchedule_B_fkey` FOREIGN KEY (`B`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
