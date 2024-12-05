-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `expired_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `DaycareJournal` (
    `id` VARCHAR(191) NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `bed_time` DATETIME(3) NOT NULL,
    `wakeup_time` DATETIME(3) NOT NULL,
    `body_temperatur` DOUBLE NOT NULL,
    `breakfast_menu` VARCHAR(191) NOT NULL,
    `is_poop` BOOLEAN NOT NULL,
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
CREATE TABLE `DaycareLogTime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fee_id` INTEGER NULL,
    `journal_id` VARCHAR(191) NOT NULL,
    `time` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DaycareJournal` ADD CONSTRAINT `DaycareJournal_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareJournal` ADD CONSTRAINT `DaycareJournal_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareLogTime` ADD CONSTRAINT `DaycareLogTime_fee_id_fkey` FOREIGN KEY (`fee_id`) REFERENCES `Fee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaycareLogTime` ADD CONSTRAINT `DaycareLogTime_journal_id_fkey` FOREIGN KEY (`journal_id`) REFERENCES `DaycareJournal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
