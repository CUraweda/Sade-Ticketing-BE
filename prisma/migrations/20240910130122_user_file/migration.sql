-- CreateTable
CREATE TABLE `ServiceRecommendation` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `doctor_id` VARCHAR(191) NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceRecommendationItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `service_id` VARCHAR(191) NOT NULL,
    `doctor_id` VARCHAR(191) NULL,
    `service_recommendation_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserFile` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `mimetype` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServiceRecommendation` ADD CONSTRAINT `ServiceRecommendation_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `DoctorProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceRecommendation` ADD CONSTRAINT `ServiceRecommendation_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `ClientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceRecommendationItem` ADD CONSTRAINT `ServiceRecommendationItem_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceRecommendationItem` ADD CONSTRAINT `ServiceRecommendationItem_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `DoctorProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceRecommendationItem` ADD CONSTRAINT `ServiceRecommendationItem_service_recommendation_id_fkey` FOREIGN KEY (`service_recommendation_id`) REFERENCES `ServiceRecommendation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFile` ADD CONSTRAINT `UserFile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
