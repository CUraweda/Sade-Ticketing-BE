-- AddForeignKey
ALTER TABLE `DaycareLinkBook` ADD CONSTRAINT `DaycareLinkBook_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `DaycareBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
