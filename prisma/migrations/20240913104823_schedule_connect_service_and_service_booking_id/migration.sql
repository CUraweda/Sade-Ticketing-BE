-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `booking_service_id` VARCHAR(191) NULL,
    ADD COLUMN `service_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_booking_service_id_fkey` FOREIGN KEY (`booking_service_id`) REFERENCES `BookingService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
