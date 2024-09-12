-- AlterTable
ALTER TABLE `Payments` ADD COLUMN `bank_account_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Payments` ADD CONSTRAINT `Payments_bank_account_id_fkey` FOREIGN KEY (`bank_account_id`) REFERENCES `BankAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
