/*
  Warnings:

  - A unique constraint covering the columns `[doctor_id,service_id]` on the table `DoctorService` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DoctorService_doctor_id_service_id_key` ON `DoctorService`(`doctor_id`, `service_id`);
