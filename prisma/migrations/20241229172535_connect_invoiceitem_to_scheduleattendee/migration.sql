/*
  Warnings:

  - You are about to drop the column `end_date` on the `InvoiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `InvoiceItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `InvoiceItem` DROP COLUMN `end_date`,
    DROP COLUMN `start_date`,
    ADD COLUMN `dates` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `_InvoiceItemToScheduleAttendee` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_InvoiceItemToScheduleAttendee_AB_unique`(`A`, `B`),
    INDEX `_InvoiceItemToScheduleAttendee_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_InvoiceItemToScheduleAttendee` ADD CONSTRAINT `_InvoiceItemToScheduleAttendee_A_fkey` FOREIGN KEY (`A`) REFERENCES `InvoiceItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_InvoiceItemToScheduleAttendee` ADD CONSTRAINT `_InvoiceItemToScheduleAttendee_B_fkey` FOREIGN KEY (`B`) REFERENCES `ScheduleAttendee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
