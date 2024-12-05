/*
  Warnings:

  - You are about to drop the `_BookingToDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_BookingToDocument` DROP FOREIGN KEY `_BookingToDocument_A_fkey`;

-- DropForeignKey
ALTER TABLE `_BookingToDocument` DROP FOREIGN KEY `_BookingToDocument_B_fkey`;

-- DropTable
DROP TABLE `_BookingToDocument`;

-- CreateTable
CREATE TABLE `BookingAgreedDocuments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `is_agreed` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BookingAgreedDocuments` ADD CONSTRAINT `BookingAgreedDocuments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingAgreedDocuments` ADD CONSTRAINT `BookingAgreedDocuments_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
