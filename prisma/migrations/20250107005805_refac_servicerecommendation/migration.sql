/*
  Warnings:

  - You are about to drop the column `title` on the `ServiceRecommendation` table. All the data in the column will be lost.
  - You are about to drop the `ServiceRecommendationItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quantity` to the `ServiceRecommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_id` to the `ServiceRecommendation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ServiceRecommendation` DROP FOREIGN KEY `ServiceRecommendation_booking_id_fkey`;

-- DropForeignKey
ALTER TABLE `ServiceRecommendationItem` DROP FOREIGN KEY `ServiceRecommendationItem_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `ServiceRecommendationItem` DROP FOREIGN KEY `ServiceRecommendationItem_service_recommendation_id_fkey`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `recommendation_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `need_recommendation` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `ServiceRecommendation` DROP COLUMN `title`,
    ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `service_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `weekly_frequency` VARCHAR(191) NULL,
    MODIFY `booking_id` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `ServiceRecommendationItem`;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_recommendation_id_fkey` FOREIGN KEY (`recommendation_id`) REFERENCES `ServiceRecommendation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceRecommendation` ADD CONSTRAINT `ServiceRecommendation_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceRecommendation` ADD CONSTRAINT `ServiceRecommendation_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
