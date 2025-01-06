import { PrismaClient } from "@prisma/client";
import { sendNotif } from "../middlewares/prisma/send-notif.js";
import { extendInvoiceUpdate } from "../middlewares/prisma/extend-invoice-update.js";

const prism = new PrismaClient().$extends({
  query: {
    invoice: {
      updateMany: extendInvoiceUpdate,
      update: extendInvoiceUpdate,
    },
    notification: {
      create: sendNotif,
    },
  },
});

export { prism };
