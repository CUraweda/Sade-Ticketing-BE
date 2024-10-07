-- DropIndex
DROP INDEX `ChatMessage_receiver_id_fkey` ON `chatmessage`;

-- DropIndex
DROP INDEX `ChatMessage_sender_id_fkey` ON `chatmessage`;

-- AlterTable
ALTER TABLE `chatmessage` ADD COLUMN `user_chat_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_user_chat_id_fkey` FOREIGN KEY (`user_chat_id`) REFERENCES `UserChat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
