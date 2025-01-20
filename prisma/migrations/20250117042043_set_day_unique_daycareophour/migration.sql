/*
  Warnings:

  - A unique constraint covering the columns `[day]` on the table `DaycareOperatingHours` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DaycareOperatingHours_day_key` ON `DaycareOperatingHours`(`day`);
