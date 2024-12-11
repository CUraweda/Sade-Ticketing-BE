-- CreateTable
CREATE TABLE `ServicePrice` (
    `id` VARCHAR(191) NOT NULL,
    `service_id` VARCHAR(191) NULL,
    `privilege_id` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServicePrice` ADD CONSTRAINT `ServicePrice_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicePrice` ADD CONSTRAINT `ServicePrice_privilege_id_fkey` FOREIGN KEY (`privilege_id`) REFERENCES `ClientPrivilege`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
