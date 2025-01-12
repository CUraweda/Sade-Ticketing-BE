/*
  Warnings:

  - You are about to drop the column `end_date` on the `RescheduleRequest` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_id` on the `RescheduleRequest` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `RescheduleRequest` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `RescheduleRequest` table. All the data in the column will be lost.
  - Added the required column `attendee_id` to the `RescheduleRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `RescheduleRequest` DROP FOREIGN KEY `RescheduleRequest_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `RescheduleRequest` DROP FOREIGN KEY `RescheduleRequest_user_id_fkey`;

-- AlterTable
ALTER TABLE `RescheduleRequest` DROP COLUMN `end_date`,
    DROP COLUMN `schedule_id`,
    DROP COLUMN `start_date`,
    DROP COLUMN `user_id`,
    ADD COLUMN `attendee_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `response` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `RescheduleRequest` ADD CONSTRAINT `RescheduleRequest_attendee_id_fkey` FOREIGN KEY (`attendee_id`) REFERENCES `ScheduleAttendee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
