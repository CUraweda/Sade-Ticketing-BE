-- DropForeignKey
ALTER TABLE `DaycareBooking` DROP FOREIGN KEY `DaycareBooking_price_id_fkey`;

-- AlterTable
ALTER TABLE `DaycareBooking` MODIFY `price_id` VARCHAR(191) NULL,
    MODIFY `start_date` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `DaycareBooking` ADD CONSTRAINT `DaycareBooking_price_id_fkey` FOREIGN KEY (`price_id`) REFERENCES `DaycarePrice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
