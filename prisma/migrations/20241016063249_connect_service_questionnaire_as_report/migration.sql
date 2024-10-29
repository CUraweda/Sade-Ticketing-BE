/*
  Warnings:

  - You are about to drop the `_QuestionnaireToService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_QuestionnaireToService` DROP FOREIGN KEY `_QuestionnaireToService_A_fkey`;

-- DropForeignKey
ALTER TABLE `_QuestionnaireToService` DROP FOREIGN KEY `_QuestionnaireToService_B_fkey`;

-- DropTable
DROP TABLE `_QuestionnaireToService`;

-- CreateTable
CREATE TABLE `_ServiceQuestionnaires` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ServiceQuestionnaires_AB_unique`(`A`, `B`),
    INDEX `_ServiceQuestionnaires_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ServiceReports` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ServiceReports_AB_unique`(`A`, `B`),
    INDEX `_ServiceReports_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ServiceQuestionnaires` ADD CONSTRAINT `_ServiceQuestionnaires_A_fkey` FOREIGN KEY (`A`) REFERENCES `Questionnaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ServiceQuestionnaires` ADD CONSTRAINT `_ServiceQuestionnaires_B_fkey` FOREIGN KEY (`B`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ServiceReports` ADD CONSTRAINT `_ServiceReports_A_fkey` FOREIGN KEY (`A`) REFERENCES `Questionnaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ServiceReports` ADD CONSTRAINT `_ServiceReports_B_fkey` FOREIGN KEY (`B`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
