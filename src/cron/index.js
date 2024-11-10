import cron from "node-cron";
import updateBookingComplete from "./update-booking-complete.js";

cron.schedule("0 7,19 * * *", updateBookingComplete);
