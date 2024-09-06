/*
  Warnings:

  - You are about to drop the column `booking_id` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `Payments_booking_id_fkey`;

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `booking_id`;

-- CreateTable
CREATE TABLE `_BookingPayments` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_BookingPayments_AB_unique`(`A`, `B`),
    INDEX `_BookingPayments_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_BookingPayments` ADD CONSTRAINT `_BookingPayments_A_fkey` FOREIGN KEY (`A`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BookingPayments` ADD CONSTRAINT `_BookingPayments_B_fkey` FOREIGN KEY (`B`) REFERENCES `Payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
