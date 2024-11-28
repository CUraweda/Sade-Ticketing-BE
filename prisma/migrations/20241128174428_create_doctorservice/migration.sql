/*
  Warnings:

  - You are about to drop the `_DoctorProfileToService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_DoctorProfileToService` DROP FOREIGN KEY `_DoctorProfileToService_A_fkey`;

-- DropForeignKey
ALTER TABLE `_DoctorProfileToService` DROP FOREIGN KEY `_DoctorProfileToService_B_fkey`;

-- AlterTable
ALTER TABLE `DoctorProfile` ADD COLUMN `grade_id` INTEGER NULL;

-- DropTable
DROP TABLE `_DoctorProfileToService`;

-- CreateTable
CREATE TABLE `DoctorGrade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `hex_color` VARCHAR(191) NULL,

    UNIQUE INDEX `DoctorGrade_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DoctorService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctor_id` VARCHAR(191) NOT NULL,
    `service_id` VARCHAR(191) NOT NULL,
    `salary` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoctorProfile` ADD CONSTRAINT `DoctorProfile_grade_id_fkey` FOREIGN KEY (`grade_id`) REFERENCES `DoctorGrade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorService` ADD CONSTRAINT `DoctorService_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `DoctorProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorService` ADD CONSTRAINT `DoctorService_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
