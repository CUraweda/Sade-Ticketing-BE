/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `ClientProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ClientProfile` ADD COLUMN `code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `DoctorSession` ADD COLUMN `booking_service_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `QuestionnaireResponse` ADD COLUMN `booking_service_id` VARCHAR(191) NULL,
    ADD COLUMN `is_locked` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `location_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `profile_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `total` DOUBLE NOT NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingService` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NULL,
    `service_id` VARCHAR(191) NULL,
    `category_id` INTEGER NULL,
    `location_id` INTEGER NULL,
    `quantity` INTEGER NOT NULL,
    `category_name` VARCHAR(191) NULL,
    `location_name` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `price_unit` VARCHAR(191) NOT NULL,
    `duration` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_additional` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attachment` (
    `id` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `file_typ` VARCHAR(191) NULL,
    `file_byte` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule` (
    `id` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payments` (
    `id` VARCHAR(191) NOT NULL,
    `amount_paid` DOUBLE NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `payment_proof_path` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BookingServiceToSchedule` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_BookingServiceToSchedule_AB_unique`(`A`, `B`),
    INDEX `_BookingServiceToSchedule_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttachmentToBookingService` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AttachmentToBookingService_AB_unique`(`A`, `B`),
    INDEX `_AttachmentToBookingService_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttachmentToSchedule` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AttachmentToSchedule_AB_unique`(`A`, `B`),
    INDEX `_AttachmentToSchedule_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ScheduleToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ScheduleToUser_AB_unique`(`A`, `B`),
    INDEX `_ScheduleToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ClientProfile_code_key` ON `ClientProfile`(`code`);

-- AddForeignKey
ALTER TABLE `DoctorSession` ADD CONSTRAINT `DoctorSession_booking_service_id_fkey` FOREIGN KEY (`booking_service_id`) REFERENCES `BookingService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionnaireResponse` ADD CONSTRAINT `QuestionnaireResponse_booking_service_id_fkey` FOREIGN KEY (`booking_service_id`) REFERENCES `BookingService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `ClientProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingService` ADD CONSTRAINT `BookingService_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingService` ADD CONSTRAINT `BookingService_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BookingServiceToSchedule` ADD CONSTRAINT `_BookingServiceToSchedule_A_fkey` FOREIGN KEY (`A`) REFERENCES `BookingService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BookingServiceToSchedule` ADD CONSTRAINT `_BookingServiceToSchedule_B_fkey` FOREIGN KEY (`B`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToBookingService` ADD CONSTRAINT `_AttachmentToBookingService_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attachment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToBookingService` ADD CONSTRAINT `_AttachmentToBookingService_B_fkey` FOREIGN KEY (`B`) REFERENCES `BookingService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToSchedule` ADD CONSTRAINT `_AttachmentToSchedule_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attachment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToSchedule` ADD CONSTRAINT `_AttachmentToSchedule_B_fkey` FOREIGN KEY (`B`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ScheduleToUser` ADD CONSTRAINT `_ScheduleToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ScheduleToUser` ADD CONSTRAINT `_ScheduleToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
