import cron from "node-cron";
import updateBookingComplete from "./update-booking-complete.js";
import updateInvoiceOverdue from "./update-invoice-overdue.js";

// set ongoing bookings to be completed everyday at 07:00 AM and 07:00 PM
cron.schedule("0 7,19 * * *", updateBookingComplete);

// set overtime invoices to be overdue everyday at 01:00 AM
cron.schedule("0 1 * * *", updateInvoiceOverdue);
