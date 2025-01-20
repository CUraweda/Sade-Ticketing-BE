/*
  Warnings:

  - You are about to drop the `_FeeToService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_FeeToService` DROP FOREIGN KEY `_FeeToService_A_fkey`;

-- DropForeignKey
ALTER TABLE `_FeeToService` DROP FOREIGN KEY `_FeeToService_B_fkey`;

-- DropTable
DROP TABLE `_FeeToService`;

-- CreateTable
CREATE TABLE `ServiceFee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fee_id` INTEGER NOT NULL,
    `service_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ServiceFee_fee_id_service_id_key`(`fee_id`, `service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServiceFee` ADD CONSTRAINT `ServiceFee_fee_id_fkey` FOREIGN KEY (`fee_id`) REFERENCES `Fee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceFee` ADD CONSTRAINT `ServiceFee_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
