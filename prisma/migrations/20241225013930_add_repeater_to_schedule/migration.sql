-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `repeat` VARCHAR(191) NULL,
    ADD COLUMN `repeat_end` DATETIME(3) NULL;
