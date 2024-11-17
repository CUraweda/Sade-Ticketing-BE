-- CreateTable
CREATE TABLE `_FeeToService` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FeeToService_AB_unique`(`A`, `B`),
    INDEX `_FeeToService_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_FeeToService` ADD CONSTRAINT `_FeeToService_A_fkey` FOREIGN KEY (`A`) REFERENCES `Fee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FeeToService` ADD CONSTRAINT `_FeeToService_B_fkey` FOREIGN KEY (`B`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
