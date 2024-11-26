import cron from "node-cron";
import updateBookingComplete from "./update-booking-complete.js";
import updateInvoiceOverdue from "./update-invoice-overdue.js";
import {
  releaseInvoiceDaily,
  releaseInvoiceMonthly,
} from "./release-invoice-by-service-billing.js";
import { generateRecurringSchedule } from "./recurring-schedule.js";

// set ongoing bookings to be completed everyday at 07:00 AM and 07:00 PM
cron.schedule("0 */6 * * *", updateBookingComplete);

// set overtime invoices to be overdue everyday at 01:00 AM
cron.schedule("0 1 * * *", updateInvoiceOverdue);

// release daily invoices
cron.schedule("0 1 * * *", releaseInvoiceDaily);

// release monthly invoices
cron.schedule("0 1 1 * *", releaseInvoiceMonthly);

// generate recurring schedule everyday at 23:00 AM
cron.schedule("0 12 * * *", generateRecurringSchedule);
