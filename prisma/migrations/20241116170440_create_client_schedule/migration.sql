/*
  Warnings:

  - You are about to drop the `_ClientProfileToSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_ClientProfileToSchedule` DROP FOREIGN KEY `_ClientProfileToSchedule_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ClientProfileToSchedule` DROP FOREIGN KEY `_ClientProfileToSchedule_B_fkey`;

-- DropTable
DROP TABLE `_ClientProfileToSchedule`;

-- CreateTable
CREATE TABLE `ClientSchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_id` VARCHAR(191) NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,

    UNIQUE INDEX `ClientSchedule_schedule_id_client_id_key`(`schedule_id`, `client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientSchedule` ADD CONSTRAINT `ClientSchedule_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientSchedule` ADD CONSTRAINT `ClientSchedule_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
