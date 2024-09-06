/*
  Warnings:

  - Added the required column `booking_id` to the `Payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `booking_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `expiry_date` DATETIME(3) NULL,
    ADD COLUMN `payment_date` DATETIME(3) NULL,
    ADD COLUMN `transaction_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Payments` ADD CONSTRAINT `Payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
