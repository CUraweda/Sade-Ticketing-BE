/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `DoctorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DoctorProfile_email_key` ON `DoctorProfile`(`email`);
