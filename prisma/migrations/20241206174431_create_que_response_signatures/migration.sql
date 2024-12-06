-- CreateTable
CREATE TABLE `QuestionnaireResponseSignature` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `response_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `signature_img_path` VARCHAR(191) NULL,
    `detail` VARCHAR(191) NULL,
    `signed_place` VARCHAR(191) NULL,
    `signed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuestionnaireResponseSignature` ADD CONSTRAINT `QuestionnaireResponseSignature_response_id_fkey` FOREIGN KEY (`response_id`) REFERENCES `QuestionnaireResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
