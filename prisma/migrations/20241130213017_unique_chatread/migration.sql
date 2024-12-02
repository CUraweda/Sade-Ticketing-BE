/*
  Warnings:

  - A unique constraint covering the columns `[chat_id,user_id]` on the table `ChatRead` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ChatRead_chat_id_user_id_key` ON `ChatRead`(`chat_id`, `user_id`);
