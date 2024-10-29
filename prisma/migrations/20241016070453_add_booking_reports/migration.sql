-- AlterTable
ALTER TABLE `QuestionnaireResponse` ADD COLUMN `booking_report_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `QuestionnaireResponse` ADD CONSTRAINT `QuestionnaireResponse_booking_report_id_fkey` FOREIGN KEY (`booking_report_id`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
