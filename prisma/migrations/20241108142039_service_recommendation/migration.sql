/*
  Warnings:

  - Added the required column `booking_id` to the `ServiceRecommendation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ServiceRecommendation` ADD COLUMN `booking_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `is_read` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `ServiceRecommendation` ADD CONSTRAINT `ServiceRecommendation_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
