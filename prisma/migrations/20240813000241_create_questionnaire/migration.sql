-- CreateTable
CREATE TABLE `Questionnaire` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Questionnaire_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceQuestionnaire` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionnaire_id` VARCHAR(191) NOT NULL,
    `service_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionnaireResponse` (
    `id` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `client_id` VARCHAR(191) NULL,
    `questionnaire_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionnaire_id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NULL,
    `label` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `typ` VARCHAR(191) NOT NULL,
    `min` INTEGER NULL,
    `max` INTEGER NULL,
    `file_typ` VARCHAR(191) NULL,
    `file_max_byte` INTEGER NULL,
    `other` BOOLEAN NOT NULL DEFAULT false,
    `required` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Question_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_id` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `response_id` VARCHAR(191) NOT NULL,
    `question_id` INTEGER NULL,
    `text` VARCHAR(191) NULL,
    `number` DOUBLE NULL,
    `date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServiceQuestionnaire` ADD CONSTRAINT `ServiceQuestionnaire_questionnaire_id_fkey` FOREIGN KEY (`questionnaire_id`) REFERENCES `Questionnaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceQuestionnaire` ADD CONSTRAINT `ServiceQuestionnaire_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionnaireResponse` ADD CONSTRAINT `QuestionnaireResponse_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionnaireResponse` ADD CONSTRAINT `QuestionnaireResponse_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `ClientProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionnaireResponse` ADD CONSTRAINT `QuestionnaireResponse_questionnaire_id_fkey` FOREIGN KEY (`questionnaire_id`) REFERENCES `Questionnaire`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_questionnaire_id_fkey` FOREIGN KEY (`questionnaire_id`) REFERENCES `Questionnaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionOption` ADD CONSTRAINT `QuestionOption_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionAnswer` ADD CONSTRAINT `QuestionAnswer_response_id_fkey` FOREIGN KEY (`response_id`) REFERENCES `QuestionnaireResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionAnswer` ADD CONSTRAINT `QuestionAnswer_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Question`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
