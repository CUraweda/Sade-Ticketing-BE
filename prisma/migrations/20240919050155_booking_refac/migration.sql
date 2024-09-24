/*
  Warnings:

  - You are about to drop the column `profile_id` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `booking_service_id` on the `DoctorSession` table. All the data in the column will be lost.
  - You are about to drop the column `booking_service_id` on the `QuestionnaireResponse` table. All the data in the column will be lost.
  - You are about to drop the column `booking_service_id` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the `BookingService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BookingToPayments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_profile_id_fkey`;

-- DropForeignKey
ALTER TABLE `BookingService` DROP FOREIGN KEY `BookingService_booking_id_fkey`;

-- DropForeignKey
ALTER TABLE `BookingService` DROP FOREIGN KEY `BookingService_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `DoctorSession` DROP FOREIGN KEY `DoctorSession_booking_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionnaireResponse` DROP FOREIGN KEY `QuestionnaireResponse_booking_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `Schedule` DROP FOREIGN KEY `Schedule_booking_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `_BookingToPayments` DROP FOREIGN KEY `_BookingToPayments_A_fkey`;

-- DropForeignKey
ALTER TABLE `_BookingToPayments` DROP FOREIGN KEY `_BookingToPayments_B_fkey`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `profile_id`,
    DROP COLUMN `total`,
    ADD COLUMN `client_id` VARCHAR(191) NULL,
    ADD COLUMN `compliant` VARCHAR(191) NULL,
    ADD COLUMN `group_label` VARCHAR(191) NULL,
    ADD COLUMN `is_approved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `service_data` LONGTEXT NULL,
    ADD COLUMN `service_id` VARCHAR(191) NULL,
    ADD COLUMN `title` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `DoctorSession` DROP COLUMN `booking_service_id`;

-- AlterTable
ALTER TABLE `QuestionnaireResponse` DROP COLUMN `booking_service_id`,
    ADD COLUMN `booking_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Schedule` DROP COLUMN `booking_service_id`,
    ADD COLUMN `bookingId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `BookingService`;

-- DropTable
DROP TABLE `_BookingToPayments`;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `bank_account_id` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `total` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `expiry_date` DATETIME(3) NULL,
    `paid_date` DATETIME(3) NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BookingToInvoice` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_BookingToInvoice_AB_unique`(`A`, `B`),
    INDEX `_BookingToInvoice_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_InvoiceToPayments` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_InvoiceToPayments_AB_unique`(`A`, `B`),
    INDEX `_InvoiceToPayments_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuestionnaireResponse` ADD CONSTRAINT `QuestionnaireResponse_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `ClientProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_bank_account_id_fkey` FOREIGN KEY (`bank_account_id`) REFERENCES `BankAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BookingToInvoice` ADD CONSTRAINT `_BookingToInvoice_A_fkey` FOREIGN KEY (`A`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BookingToInvoice` ADD CONSTRAINT `_BookingToInvoice_B_fkey` FOREIGN KEY (`B`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_InvoiceToPayments` ADD CONSTRAINT `_InvoiceToPayments_A_fkey` FOREIGN KEY (`A`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_InvoiceToPayments` ADD CONSTRAINT `_InvoiceToPayments_B_fkey` FOREIGN KEY (`B`) REFERENCES `Payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
