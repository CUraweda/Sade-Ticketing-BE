/*
  Warnings:

  - You are about to drop the `ScheduleParticipant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creator_id` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ScheduleParticipant` DROP FOREIGN KEY `ScheduleParticipant_client_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScheduleParticipant` DROP FOREIGN KEY `ScheduleParticipant_doctor_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScheduleParticipant` DROP FOREIGN KEY `ScheduleParticipant_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `ScheduleParticipant` DROP FOREIGN KEY `ScheduleParticipant_user_id_fkey`;

-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `creator_id` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `ScheduleParticipant`;

-- CreateTable
CREATE TABLE `_DoctorProfileToSchedule` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DoctorProfileToSchedule_AB_unique`(`A`, `B`),
    INDEX `_DoctorProfileToSchedule_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ClientProfileToSchedule` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ClientProfileToSchedule_AB_unique`(`A`, `B`),
    INDEX `_ClientProfileToSchedule_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DoctorProfileToSchedule` ADD CONSTRAINT `_DoctorProfileToSchedule_A_fkey` FOREIGN KEY (`A`) REFERENCES `DoctorProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DoctorProfileToSchedule` ADD CONSTRAINT `_DoctorProfileToSchedule_B_fkey` FOREIGN KEY (`B`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ClientProfileToSchedule` ADD CONSTRAINT `_ClientProfileToSchedule_A_fkey` FOREIGN KEY (`A`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ClientProfileToSchedule` ADD CONSTRAINT `_ClientProfileToSchedule_B_fkey` FOREIGN KEY (`B`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
