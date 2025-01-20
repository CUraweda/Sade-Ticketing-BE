/*
  Warnings:

  - You are about to drop the column `additional_id` on the `DaycareActivity` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Fee` table. All the data in the column will be lost.
  - You are about to drop the `DaycareAdditional` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DaycareActivity` DROP FOREIGN KEY `DaycareActivity_additional_id_fkey`;

-- AlterTable
ALTER TABLE `DaycareActivity` DROP COLUMN `additional_id`,
    ADD COLUMN `fee_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Fee` DROP COLUMN `tags`,
    ADD COLUMN `is_available` BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE `DaycareAdditional`;

-- CreateTable
CREATE TABLE `FeeTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `FeeTag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FeeToFeeTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_FeeToFeeTag_AB_unique`(`A`, `B`),
    INDEX `_FeeToFeeTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DaycareActivity` ADD CONSTRAINT `DaycareActivity_fee_id_fkey` FOREIGN KEY (`fee_id`) REFERENCES `Fee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FeeToFeeTag` ADD CONSTRAINT `_FeeToFeeTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Fee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FeeToFeeTag` ADD CONSTRAINT `_FeeToFeeTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `FeeTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
