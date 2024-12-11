/*
  Warnings:

  - You are about to drop the column `image_path` on the `clientprivilege` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `clientprivilege` table. All the data in the column will be lost.
  - Added the required column `privilege_id` to the `ClientPrivilege` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `serviceprice` DROP FOREIGN KEY `ServicePrice_privilege_id_fkey`;

-- AlterTable
ALTER TABLE `clientprivilege` DROP COLUMN `image_path`,
    DROP COLUMN `title`,
    ADD COLUMN `privilege_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Privilege` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `image_path` VARCHAR(191) NULL,
    `description` LONGTEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServicePrice` ADD CONSTRAINT `ServicePrice_privilege_id_fkey` FOREIGN KEY (`privilege_id`) REFERENCES `Privilege`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientPrivilege` ADD CONSTRAINT `ClientPrivilege_privilege_id_fkey` FOREIGN KEY (`privilege_id`) REFERENCES `Privilege`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
