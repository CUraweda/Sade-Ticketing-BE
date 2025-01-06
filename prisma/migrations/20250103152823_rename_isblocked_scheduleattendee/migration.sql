/*
  Warnings:

  - You are about to drop the column `is_blocked` on the `ScheduleAttendee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ScheduleAttendee` DROP COLUMN `is_blocked`,
    ADD COLUMN `is_active` BOOLEAN NULL DEFAULT false;
