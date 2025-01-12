import cron from "node-cron";
import updateBookingComplete from "./update-booking-complete.js";
import updateInvoiceOverdue from "./update-invoice-overdue.js";
import {
  releaseInvoiceDaily,
  releaseInvoiceMonthly,
} from "./release-invoice-by-service-billing.js";
import { releaseSpecialistSalary } from "./release-specialist-salary.js";
import { createRepeatSchedules } from "./create-repeat-schedules.js";
import updateBookingStatus from "./update-booking-status.js";

// set ongoing bookings to be completed every 30 min between 1:00 - 11:00 (8:00 - 18:00 in ID)
cron.schedule("*/30 1-11 * * *", updateBookingStatus);

// create repeats schedule in a new month every 25th day of month at 0:05 (6:00 in ID)
cron.schedule("5 0 25 * *", createRepeatSchedules);

// release daily invoices every day at 0:10 (7:10 in ID)
// cron.schedule("10 0 * * *", releaseInvoiceDaily);

// release monthly invoices every first day of the month at 0:20 (7:20 in ID)
// cron.schedule("20 0 1 * *", releaseInvoiceMonthly);

// set overtime invoices to be overdue everyday at 0:30 (7:30 in ID)
cron.schedule("30 0 * * *", updateInvoiceOverdue);

// release specialist salary everyday at 0:40 (7:40 in ID)
// cron.schedule("40 0 * * *", releaseSpecialistSalary);
