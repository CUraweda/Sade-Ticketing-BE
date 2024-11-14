-- AlterTable
ALTER TABLE `DaycareJournal` MODIFY `bed_time` DATETIME(3) NULL,
    MODIFY `wakeup_time` DATETIME(3) NULL,
    MODIFY `body_temperatur` DOUBLE NULL,
    MODIFY `breakfast_menu` VARCHAR(191) NULL,
    MODIFY `is_poop` BOOLEAN NULL;
