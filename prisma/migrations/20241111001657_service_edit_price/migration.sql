-- AlterTable
ALTER TABLE `Service` ADD COLUMN `is_price_entry` BOOLEAN NULL DEFAULT false,
    MODIFY `price_unit` VARCHAR(191) NULL;
