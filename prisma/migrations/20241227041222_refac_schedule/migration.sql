/*
  Warnings:

  - You are about to drop the column `creator_id` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `max_bookings` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `overtime_minutes` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `recurring` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the `ClientSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BookingToSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ClientSchedule` DROP FOREIGN KEY `ClientSchedule_client_id_fkey`;

-- DropForeignKey
ALTER TABLE `ClientSchedule` DROP FOREIGN KEY `ClientSchedule_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `Schedule` DROP FOREIGN KEY `Schedule_creator_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserFile` DROP FOREIGN KEY `UserFile_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `_BookingToSchedule` DROP FOREIGN KEY `_BookingToSchedule_A_fkey`;

-- DropForeignKey
ALTER TABLE `_BookingToSchedule` DROP FOREIGN KEY `_BookingToSchedule_B_fkey`;

-- AlterTable
ALTER TABLE `Schedule` DROP COLUMN `creator_id`,
    DROP COLUMN `max_bookings`,
    DROP COLUMN `overtime_minutes`,
    DROP COLUMN `recurring`,
    ADD COLUMN `max_attendees` INTEGER NULL DEFAULT 1;

-- DropTable
DROP TABLE `ClientSchedule`;

-- DropTable
DROP TABLE `UserFile`;

-- DropTable
DROP TABLE `_BookingToSchedule`;

-- CreateTable
CREATE TABLE `ScheduleAttendee` (
    `id` VARCHAR(191) NOT NULL,
    `schedule_id` VARCHAR(191) NULL,
    `client_id` VARCHAR(191) NULL,
    `booking_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `overtime` INTEGER NULL,
    `is_blocked` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ScheduleAttendee_schedule_id_client_id_key`(`schedule_id`, `client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScheduleAttendee` ADD CONSTRAINT `ScheduleAttendee_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `Schedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleAttendee` ADD CONSTRAINT `ScheduleAttendee_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `ClientProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleAttendee` ADD CONSTRAINT `ScheduleAttendee_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
