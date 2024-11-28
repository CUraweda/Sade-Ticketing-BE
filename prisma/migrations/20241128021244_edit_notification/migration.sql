/*
  Warnings:

  - You are about to drop the column `reference_id` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Notification` DROP COLUMN `reference_id`,
    ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `payload` LONGTEXT NULL,
    ADD COLUMN `sender_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
