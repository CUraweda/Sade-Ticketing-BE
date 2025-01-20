-- CreateTable
CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DaycarePrice` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `invoice_cycle` VARCHAR(191) NOT NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DaycarePrice_price_invoice_cycle_key`(`price`, `invoice_cycle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DaycareAdditional` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DaycareOperatingHours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` VARCHAR(191) NOT NULL,
    `start_time` VARCHAR(191) NULL,
    `end_time` VARCHAR(191) NULL,
    `is_open` BOOLEAN NOT NULL DEFAULT false,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DaycareBooking` (
    `id` VARCHAR(191) NOT NULL,
    `price_id` VARCHAR(191) NOT NULL,
    `client_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DaycareAgreement` (
    `document_id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `is_agree` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`document_id`, `booking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DaycareShortReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` VARCHAR(191) NOT NULL,
    `cycle` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NULL,
    `height` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DaycareLinkBook` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `status_note` VARCHAR(191) NULL,
    `bed_time` DATETIME(3) NULL,
    `wakeup_time` DATETIME(3) NULL,
    `is_poop` BOOLEAN NULL,
    `body_temp` DOUBLE NULL,
    `breakfast_menu` VARCHAR(191) NULL,
    `parent_note` LONGTEXT NULL,
    `morning_snack` VARCHAR(191) NULL,
    `noon_snack` VARCHAR(191) NULL,
    `afternoon_snack` VARCHAR(191) NULL,
    `is_sleep_soundly` BOOLEAN NULL,
    `poop_count` INTEGER NULL,
    `fav_activity` VARCHAR(191) NULL,
    `daily_progress_report` LONGTEXT NULL,
    `facilitator_note` LONGTEXT NULL,
    `today_feeling` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DaycareActivity` (
    `id` VARCHAR(191) NOT NULL,
    `linkbook_id` VARCHAR(191) NOT NULL,
    `additional_id` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DaycareBookingSitIn` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DaycareBookingSitIn_AB_unique`(`A`, `B`),
    INDEX `_DaycareBookingSitIn_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DaycareBookingReport` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DaycareBookingReport_AB_unique`(`A`, `B`),
    INDEX `_DaycareBookingReport_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DaycareBookingToInvoice` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DaycareBookingToInvoice_AB_unique`(`A`, `B`),
    INDEX `_DaycareBookingToInvoice_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DaycareBooking` ADD CONSTRAINT `DaycareBooking_price_id_fkey` FOREIGN KEY (`price_id`) REFERENCES `DaycarePrice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareBooking` ADD CONSTRAINT `DaycareBooking_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `ClientProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareBooking` ADD CONSTRAINT `DaycareBooking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareAgreement` ADD CONSTRAINT `DaycareAgreement_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareAgreement` ADD CONSTRAINT `DaycareAgreement_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `DaycareBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareShortReport` ADD CONSTRAINT `DaycareShortReport_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `DaycareBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareActivity` ADD CONSTRAINT `DaycareActivity_linkbook_id_fkey` FOREIGN KEY (`linkbook_id`) REFERENCES `DaycareLinkBook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareActivity` ADD CONSTRAINT `DaycareActivity_additional_id_fkey` FOREIGN KEY (`additional_id`) REFERENCES `DaycareAdditional`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DaycareBookingSitIn` ADD CONSTRAINT `_DaycareBookingSitIn_A_fkey` FOREIGN KEY (`A`) REFERENCES `DaycareBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DaycareBookingSitIn` ADD CONSTRAINT `_DaycareBookingSitIn_B_fkey` FOREIGN KEY (`B`) REFERENCES `QuestionnaireResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DaycareBookingReport` ADD CONSTRAINT `_DaycareBookingReport_A_fkey` FOREIGN KEY (`A`) REFERENCES `DaycareBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DaycareBookingReport` ADD CONSTRAINT `_DaycareBookingReport_B_fkey` FOREIGN KEY (`B`) REFERENCES `QuestionnaireResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DaycareBookingToInvoice` ADD CONSTRAINT `_DaycareBookingToInvoice_A_fkey` FOREIGN KEY (`A`) REFERENCES `DaycareBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DaycareBookingToInvoice` ADD CONSTRAINT `_DaycareBookingToInvoice_B_fkey` FOREIGN KEY (`B`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
