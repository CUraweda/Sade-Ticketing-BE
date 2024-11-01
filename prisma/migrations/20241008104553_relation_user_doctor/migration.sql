/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `DoctorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DoctorProfile_user_id_key` ON `DoctorProfile`(`user_id`);
