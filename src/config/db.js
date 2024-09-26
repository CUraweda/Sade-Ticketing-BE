import { PrismaClient } from "@prisma/client";
import { upBookingStatusOnUpdateManyInvoice } from "../middlewares/prisma/update-booking.js";

const prism = new PrismaClient().$extends({
  query: {
    invoice: {
      updateMany: upBookingStatusOnUpdateManyInvoice,
    },
  },
});

export { prism };
