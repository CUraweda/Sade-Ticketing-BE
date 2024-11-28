import { PrismaClient } from "@prisma/client";
import { upBookingStatusOnUpdateInvoice } from "../middlewares/prisma/update-booking.js";
import { sendNotif } from "../middlewares/prisma/send-notif.js";

const prism = new PrismaClient().$extends({
  query: {
    invoice: {
      updateMany: upBookingStatusOnUpdateInvoice,
      update: upBookingStatusOnUpdateInvoice,
    },
    notification: {
      create: sendNotif,
    },
  },
});

export { prism };
