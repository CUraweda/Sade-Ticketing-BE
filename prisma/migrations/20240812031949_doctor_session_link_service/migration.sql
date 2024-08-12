-- AlterTable
ALTER TABLE `DoctorSession` ADD COLUMN `service_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `DoctorSession` ADD CONSTRAINT `DoctorSession_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
