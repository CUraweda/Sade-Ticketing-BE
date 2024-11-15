/*
  Warnings:

  - A unique constraint covering the columns `[booking_id,document_id]` on the table `BookingAgreedDocuments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `BookingAgreedDocuments_booking_id_document_id_key` ON `BookingAgreedDocuments`(`booking_id`, `document_id`);
