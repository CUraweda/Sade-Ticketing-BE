import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";
import { InvoiceStatus } from "../core/invoice/invoice.validator.js";

/** @type {PrismaClient} */
const db = prism;

const updateInvoiceOverdue = async () => {
  console.log("\n\x1b[34m[CRON]\x1b[0m Update Invoices Overdue");
  const now = moment();

  try {
    const overdueInvs = await db.invoice.updateMany({
      where: {
        status: InvoiceStatus.ISSUED,
        expiry_date: {
          lt: now.toDate(),
        },
      },
      data: {
        status: InvoiceStatus.OVERDUE,
      },
    });

    console.log(`- Overdue invoices: ${overdueInvs?.length ?? 0}`);
  } catch (err) {
    console.error(err);
  }
};

export default updateInvoiceOverdue;
