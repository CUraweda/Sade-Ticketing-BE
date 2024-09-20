/*
  Warnings:

  - You are about to drop the `_InvoiceToPayments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Invoice` DROP FOREIGN KEY `Invoice_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `_InvoiceToPayments` DROP FOREIGN KEY `_InvoiceToPayments_A_fkey`;

-- DropForeignKey
ALTER TABLE `_InvoiceToPayments` DROP FOREIGN KEY `_InvoiceToPayments_B_fkey`;

-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `payment_id` VARCHAR(191) NULL,
    MODIFY `user_id` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `_InvoiceToPayments`;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
