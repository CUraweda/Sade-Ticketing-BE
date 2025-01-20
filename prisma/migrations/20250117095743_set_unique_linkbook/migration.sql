/*
  Warnings:

  - A unique constraint covering the columns `[booking_id,date]` on the table `DaycareLinkBook` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DaycareLinkBook_booking_id_date_key` ON `DaycareLinkBook`(`booking_id`, `date`);
