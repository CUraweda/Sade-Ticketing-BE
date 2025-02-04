/*
  Warnings:

  - You are about to drop the column `recommendation_id` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `ServiceRecommendation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_recommendation_id_fkey`;

-- DropForeignKey
ALTER TABLE `ServiceRecommendation` DROP FOREIGN KEY `ServiceRecommendation_booking_id_fkey`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `recommendation_id`;

-- AlterTable
ALTER TABLE `ServiceRecommendation` DROP COLUMN `booking_id`;

-- CreateTable
CREATE TABLE `_BookingToServiceRecommendation` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_BookingToServiceRecommendation_AB_unique`(`A`, `B`),
    INDEX `_BookingToServiceRecommendation_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_BookingToServiceRecommendation` ADD CONSTRAINT `_BookingToServiceRecommendation_A_fkey` FOREIGN KEY (`A`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BookingToServiceRecommendation` ADD CONSTRAINT `_BookingToServiceRecommendation_B_fkey` FOREIGN KEY (`B`) REFERENCES `ServiceRecommendation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
