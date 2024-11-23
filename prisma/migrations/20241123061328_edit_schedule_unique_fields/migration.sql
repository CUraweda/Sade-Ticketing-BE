/*
  Warnings:

  - A unique constraint covering the columns `[start_date,end_date,parent_id]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Schedule_start_date_end_date_parent_id_key` ON `Schedule`(`start_date`, `end_date`, `parent_id`);
