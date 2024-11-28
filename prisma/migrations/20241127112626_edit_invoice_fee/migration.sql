/*
  Warnings:

  - Added the required column `name` to the `InvoiceFee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `InvoiceFee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `InvoiceFee` DROP FOREIGN KEY `InvoiceFee_fee_id_fkey`;

-- AlterTable
ALTER TABLE `InvoiceFee` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL,
    MODIFY `fee_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `InvoiceItem` MODIFY `service_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `InvoiceFee` ADD CONSTRAINT `InvoiceFee_fee_id_fkey` FOREIGN KEY (`fee_id`) REFERENCES `Fee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
