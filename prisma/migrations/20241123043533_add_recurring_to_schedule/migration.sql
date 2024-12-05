-- AlterTable
ALTER TABLE `DaycareJournal` ADD COLUMN `is_present` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `recurring` VARCHAR(191) NULL;
