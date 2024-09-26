import { PrismaClient } from "@prisma/client";
import { upBookingStatusOnUpdateInvoice } from "../middlewares/prisma/update-booking.js";

const prism = new PrismaClient().$extends({
  query: {
    invoice: {
      updateMany: upBookingStatusOnUpdateInvoice,
      update: upBookingStatusOnUpdateInvoice,
    },
  },
});

export { prism };
