import cron from "node-cron";
import updateInvoiceOverdue from "./update-invoice-overdue.js";
import { createRepeatSchedules } from "./create-repeat-schedules.js";
import updateBookingStatus from "./update-booking-status.js";
import {
  releaseDaycareBillingDaily,
  releaseDaycareBillingMonthly,
} from "./release-daycare-billing.js";

// set ongoing bookings to be completed every 30 min between 1:00 - 11:00 (8:00 - 18:00 in ID)
cron.schedule("*/30 1-11 * * *", updateBookingStatus);

// create repeats schedule in a new month every 25th day of month at 0:05 (6:00 in ID)
cron.schedule("5 0 25 * *", createRepeatSchedules);

// set overtime invoices to be overdue everyday at 0:10 (7:10 in ID)
cron.schedule("10 0 * * *", updateInvoiceOverdue);

// release invoice monthly every first day of the month at 0:15 (7.15 in ID)
cron.schedule("15 0 1 * *", releaseDaycareBillingMonthly);

// release invoice daily every first day of the month at 0:20 (7.20 in ID)
cron.schedule("20 0 * * *", releaseDaycareBillingDaily);
