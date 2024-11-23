-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `parent_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Schedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
