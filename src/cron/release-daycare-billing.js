import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";
import { DaycareBookingStatus } from "../core/daycarebooking/daycarebooking.validator.js";
import { TimeCycle } from "../base/validator.base.js";
import { InvoiceStatus } from "../core/invoice/invoice.validator.js";
import InvoiceService from "../core/invoice/invoice.service.js";

/** @type {PrismaClient} */
const db = prism;

const invoiceService = new InvoiceService();

const releaseDaycareBillingMonthly = async () => {
  console.log(`\n\x1b[34m[CRON]\x1b[0m Release Daycare Billing Monthly`);

  try {
    const invoices = [];

    const bookings = await db.daycareBooking.findMany({
      where: {
        status: DaycareBookingStatus.ONGOING,
        price: { invoice_cycle: TimeCycle.MONTHLY },
      },
      include: {
        price: true,
        link_books: {
          select: { activities: { select: { fee: true } } },
          where: {
            date: {
              gte: moment()
                .subtract(1, "month")
                .startOf("month")
                .startOf("day")
                .toDate(),
              lte: moment()
                .subtract(1, "month")
                .endOf("month")
                .endOf("day")
                .toDate(),
            },
          },
        },
      },
    });

    if (bookings.length)
      bookings.forEach((b) => {
        const inv = {
          user_id: b.user_id,
          daycare_bookings: [b.id],
          title: `Tagihan Bulanan Daycare ${moment().locale("id").format("MMMM YYYY")}`,
          status: InvoiceStatus.ISSUED,
          expiry_date: moment().add(1, "day").toDate(),
          items: [
            {
              dates: `${moment().toDate()}`,
              name: `${b.price.title} Daycare ${moment().locale("id").format("MMMM")}`,
              quantity: 1,
              price: b.price.price,
            },
          ],
        };

        const activityFees = b.link_books
          .reduce((a, c) => {
            const fees = c.activities.reduce((a, c) => {
              if (c.fee) a.push(c.fee);
              return a;
            }, []);
            a.push(fees);
            return a;
          }, [])
          .flat();

        const fees = activityFees.reduce((a, c) => {
          const find = a.find((aa) => aa.fee_id == c.id);

          if (find) find.quantity += 1;
          else
            a.push({
              fee_id: c.id,
              name: c.title,
              quantity: 1,
              price: c.price,
            });

          return a;
        }, []);

        inv["fees"] = fees;

        invoices.push(inv);
      });

    let created = 0;
    if (invoices.length) {
      for (const inv of invoices) {
        try {
          await invoiceService.create(inv);
          created++;
        } catch (err) {
          console.error(err);
        }
      }
    }

    console.log(`- Generated invoices: ${invoices.length}`);
    console.log(`- Created invoices: ${created}`);
  } catch (err) {
    console.error(err);
  }
};

const releaseDaycareBillingDaily = async () => {
  console.log(`\n\x1b[34m[CRON]\x1b[0m Release Daycare Billing Daily`);

  try {
    const invoices = [];

    const bookings = await db.daycareBooking.findMany({
      where: {
        status: DaycareBookingStatus.ONGOING,
        price: { invoice_cycle: TimeCycle.DAILY },
      },
      include: {
        price: true,
        link_books: {
          select: { activities: { select: { fee: true } } },
          where: {
            date: {
              gte: moment().subtract(1, "day").startOf("day").toDate(),
              lte: moment().subtract(1, "day").endOf("day").toDate(),
            },
          },
        },
      },
    });

    if (bookings.length)
      bookings.forEach((b) => {
        const inv = {
          user_id: b.user_id,
          daycare_bookings: [b.id],
          title: `Tagihan Harian Daycare ${moment().locale("id").format("MMMM YYYY")}`,
          status: InvoiceStatus.ISSUED,
          expiry_date: moment().add(1, "day").toDate(),
          items: [
            {
              dates: `${moment().toDate()}`,
              name: `${b.price.title} Daycare ${moment().locale("id").format("MMMM")}`,
              quantity: 1,
              price: b.price.price,
            },
          ],
        };

        const activityFees = b.link_books
          .reduce((a, c) => {
            const fees = c.activities.reduce((a, c) => {
              if (c.fee) a.push(c.fee);
              return a;
            }, []);
            a.push(fees);
            return a;
          }, [])
          .flat();

        const fees = activityFees.reduce((a, c) => {
          const find = a.find((aa) => aa.fee_id == c.id);

          if (find) find.quantity += 1;
          else
            a.push({
              fee_id: c.id,
              name: c.title,
              quantity: 1,
              price: c.price,
            });

          return a;
        }, []);

        inv["fees"] = fees;

        invoices.push(inv);
      });

    let created = 0;
    if (invoices.length) {
      for (const inv of invoices) {
        try {
          await invoiceService.create(inv);
          created++;
        } catch (err) {
          console.error(err);
        }
      }
    }

    console.log(`- Generated invoices: ${invoices.length}`);
    console.log(`- Created invoices: ${created}`);
  } catch (err) {
    console.error(err);
  }
};

export { releaseDaycareBillingMonthly, releaseDaycareBillingDaily };
