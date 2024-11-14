import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";
import { InvoiceStatus } from "../core/invoice/invoice.validator.js";
import { parseJson } from "../utils/transform.js";
import { ServiceBillingType } from "../core/service/service.validator.js";

/** @type {PrismaClient} */
const db = prism;

const releaseInvoiceDaily = async () => {
  console.log("\n\n/cron/release-invoice-by-service-billing.js\n");

  try {
    const invoices = [];

    const bookings = await db.booking.findMany({
      where: {
        service: {
          billing_type: ServiceBillingType.DAILY,
        },
      },
      include: {
        schedules: {
          where: {
            start_date: {
              lte: moment().subtract(1, "day").endOf("day").toDate(),
              gte: moment().subtract(1, "day").startOf("day").toDate(),
            },
          },
        },
        daycare_journals: {
          where: {
            date: {
              gte: moment().subtract(1, "day").startOf("day").toDate(),
              lte: moment().subtract(1, "day").endOf("day").toDate(),
            },
          },
        },
      },
    });

    if (bookings?.length) {
      const bookingByUser = bookings.reduce((acc, curr) => {
        if (!acc[curr.user_id]) acc[curr.user_id] = [];

        acc[curr.user_id].push(curr);
        return acc;
      }, {});

      Object.entries(bookingByUser).forEach(([userId, bookings]) => {
        const items = [];

        bookings.forEach((b) => {
          const service = parseJson(b.service_data, {
            keep: ["id", "price", "category", "title", "price_unit"],
          });
          let quantity = 0;

          if (service.category?.name == "Daycare") {
            quantity = b.daycare_journals.length;
          } else {
            quantity = b.schedules.length;
          }

          if (quantity > 0) {
            items.push({
              start_date: b.schedules[0].start_date,
              end_date:
                b.schedules[b.schedules.length - 1].end_date ??
                b.schedules[b.schedules.length - 1].start_date,
              name: `${service.category?.name ?? ""} - ${service.title ?? ""}`,
              quantity,
              quantity_unit: service.price_unit,
              price: service.price,
              service_id: service.id,
            });
          }
        });

        invoices.push({
          user_id: userId,
          title: `Tagihan layanan harian - ${moment().subtract(1, "day").format("DD MMMM YYYY")}`,
          total: items.reduce((a, c) => (a += c.quantity * c.price), 0),
          status: InvoiceStatus.ISSUED,
          expiry_date: moment().add({ day: 3 }).endOf("day").toDate(),
          items: {
            create: items,
          },
          bookings: {
            connect: bookings.map((b) => ({ id: b.id })),
          },
        });
      });

      for (const inv of invoices) {
        await db.invoice.create({ data: inv });
      }
    }

    `==== Daily Invoices ====\nInvoices: ${invoices.length}\nTotal: Rp ${invoices.reduce((a, c) => (a += c.total), 0)}`;
  } catch (err) {
    console.error(err);
  }
};

const releaseInvoiceMonthly = async () => {
  console.log("\n\n/cron/release-invoice-by-service-billing.js\n");

  try {
    const invoices = [];

    const bookings = await db.booking.findMany({
      where: {
        service: {
          billing_type: ServiceBillingType.MONTHLY,
        },
      },
      include: {
        schedules: {
          where: {
            start_date: {
              lte: moment().subtract(1, "month").endOf("month").toDate(),
              gte: moment().subtract(1, "month").startOf("month").toDate(),
            },
          },
        },
        daycare_journals: {
          where: {
            date: {
              gte: moment().subtract(1, "month").startOf("month").toDate(),
              lte: moment().subtract(1, "month").endOf("month").toDate(),
            },
          },
        },
      },
    });

    if (bookings?.length) {
      const bookingByUser = bookings.reduce((acc, curr) => {
        if (!acc[curr.user_id]) acc[curr.user_id] = [];

        acc[curr.user_id].push(curr);
        return acc;
      }, {});

      Object.entries(bookingByUser).forEach(([userId, bookings]) => {
        const items = [];

        bookings.forEach((b) => {
          const service = parseJson(b.service_data, {
            keep: ["id", "price", "category", "title", "price_unit"],
          });
          let quantity = 0;

          if (service.category?.name == "Daycare") {
            quantity = 1;
          } else {
            quantity = b.schedules.length;
          }

          if (quantity > 0) {
            items.push({
              start_date: b.schedules[0].start_date,
              end_date:
                b.schedules[b.schedules.length - 1].end_date ??
                b.schedules[b.schedules.length - 1].start_date,
              name: `${service.category?.name ?? ""} - ${service.title ?? ""}`,
              quantity,
              quantity_unit: service.price_unit,
              price: service.price,
              service_id: service.id,
            });
          }
        });

        invoices.push({
          user_id: userId,
          title: `Tagihan layanan bulanan - ${moment().subtract(1, "month").format("MMMM YYYY")}`,
          total: items.reduce((a, c) => (a += c.quantity * c.price), 0),
          status: InvoiceStatus.ISSUED,
          expiry_date: moment().add({ day: 3 }).endOf("day").toDate(),
          items: {
            create: items,
          },
          bookings: {
            connect: bookings.map((b) => ({ id: b.id })),
          },
        });
      });

      for (const inv of invoices) {
        await db.invoice.create({ data: inv });
      }
    }

    console.log(
      `==== Monthly Invoices ====\nInvoices: ${invoices.length}\nTotal: Rp ${invoices.reduce((a, c) => (a += c.total), 0)}`
    );
  } catch (err) {
    console.error(err);
  }
};

export { releaseInvoiceDaily, releaseInvoiceMonthly };
