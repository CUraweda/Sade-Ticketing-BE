import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";
import { InvoiceStatus } from "../core/invoice/invoice.validator.js";
import { parseJson } from "../utils/transform.js";
import { ServiceBillingType } from "../core/service/service.validator.js";
import { ClientScheduleStatus } from "../core/schedule/schedule.validator.js";

/** @type {PrismaClient} */
const db = prism;

const releaseInvoiceDaily = async () => {
  console.log("\n\x1b[34m[CRON]\x1b[0m Create Daily Invoices");

  try {
    const invoices = [];

    const bookings = await db.booking.findMany({
      where: {
        service: {
          billing_type: ServiceBillingType.DAILY,
        },
        OR: [
          {
            schedules: {
              some: {
                start_date: {
                  lte: moment().subtract(1, "day").endOf("day").toDate(),
                  gte: moment().subtract(1, "day").startOf("day").toDate(),
                },
              },
            },
          },
          {
            daycare_journals: {
              some: {
                date: {
                  lte: moment().subtract(1, "day").endOf("day").toDate(),
                  gte: moment().subtract(1, "day").startOf("day").toDate(),
                },
              },
            },
          },
        ],
      },
      include: {
        schedules: {
          include: {
            clients: {
              include: {
                client: {
                  select: {
                    user_id: true,
                  },
                },
              },
            },
            service: {
              include: {
                service_prices: {
                  include: {
                    privilege: {
                      include: {
                        privileges: true,
                      },
                    },
                  },
                },
              },
            },
          },
          where: {
            start_date: {
              lte: moment().subtract(1, "day").endOf("day").toDate(),
              gte: moment().subtract(1, "day").startOf("day").toDate(),
            },
          },
        },
        client: {
          include: {
            client_privileges: true,
          },
        },
        daycare_journals: {
          include: {
            logtime: {
              include: {
                fee: true,
              },
            },
          },
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
        const items = [],
          fees = [];

        bookings.forEach((b) => {
          const service = parseJson(b.service_data, {
            keep: ["id", "price", "category", "title", "price_unit"],
          });
          const schedules = b.schedules.filter(
            (sc) =>
              sc.clients?.length &&
              (sc.clients[0].status == ClientScheduleStatus.PRESENT ||
                sc.clients[0].status == null) &&
              sc.clients[0].client?.user_id == userId
          );
          let quantity = 0;

          if (service.category?.name == "Daycare") {
            quantity = b.daycare_journals.length;

            const logs = b.daycare_journals
              .map((dj) => dj.logtime.filter((lt) => lt.fee_id != null))
              .flat();
            if (logs.length)
              logs.forEach((l) => {
                fees.push({
                  fee_id: l.fee_id,
                  name: l.fee.title,
                  quantity: 1,
                  price: l.fee.price,
                });
              });
          } else {
            quantity = schedules.length;
          }

          const clientPrivileges = b?.client?.client_privileges || [];

          const servicePrices =
            schedules?.[schedules.length - 1]?.service?.service_prices || [];

          let usedPrivileges = null;
          const lowestPrice = servicePrices.reduce((minPrice, item) => {
            const isMatched = clientPrivileges.some(
              (clientPrivilege) =>
                clientPrivilege.privilege_id === item.privilege.id
            );

            if (isMatched && (minPrice === null || item.price < minPrice)) {
              usedPrivileges = item.privilege;
              return item.price;
            }

            return minPrice;
          }, null);

          if (quantity > 0) {
            items.push({
              start_date: schedules[0]?.start_date,
              end_date:
                schedules[schedules.length - 1]?.end_date ??
                schedules[schedules.length - 1]?.start_date,
              name: `${service.category?.name ?? ""} - ${service.title ?? ""}`,
              quantity,
              quantity_unit: service.price_unit,
              price: lowestPrice ? lowestPrice : service.price,
              service_id: service.id,
              note:
                usedPrivileges && lowestPrice
                  ? `Biaya khusus ${usedPrivileges.title}`
                  : undefined,
            });
          }
        });

        if (items.length || fees.length) {
          invoices.push({
            user_id: userId,
            title: `Tagihan layanan harian - ${moment().subtract(1, "day").format("DD MMMM YYYY")}`,
            total:
              items.reduce((a, c) => (a += c.quantity * c.price), 0) +
              fees.reduce((a, c) => (a += c.quantity * c.price), 0),
            status: InvoiceStatus.ISSUED,
            expiry_date: moment().add({ day: 3 }).endOf("day").toDate(),
            items: {
              create: items,
            },
            fees: {
              create: fees,
            },
            bookings: {
              connect: bookings.map((b) => ({ id: b.id })),
            },
          });
        }
      });

      for (const inv of invoices) {
        await db.invoice.create({ data: inv });
      }
    }

    console.log(
      `- Invoices: ${invoices.length}\n- Total: Rp ${invoices.reduce((a, c) => (a += c.total), 0)}`
    );
  } catch (err) {
    console.error(err);
  }
};

const releaseInvoiceMonthly = async () => {
  console.log("\n[CRON] Create Monthly Invoices");
  try {
    const invoices = [];

    const bookings = await db.booking.findMany({
      where: {
        service: {
          billing_type: ServiceBillingType.MONTHLY,
        },
        OR: [
          {
            schedules: {
              some: {
                start_date: {
                  lte: moment().subtract(1, "month").endOf("month").toDate(),
                  gte: moment().subtract(1, "month").startOf("month").toDate(),
                },
              },
            },
          },
          {
            daycare_journals: {
              some: {
                date: {
                  lte: moment().subtract(1, "month").endOf("month").toDate(),
                  gte: moment().subtract(1, "month").startOf("month").toDate(),
                },
              },
            },
          },
        ],
      },
      include: {
        schedules: {
          include: {
            clients: {
              include: {
                client: {
                  select: {
                    user_id: true,
                  },
                },
              },
            },
            service: {
              include: {
                service_prices: {
                  include: {
                    privilege: {
                      include: {
                        privileges: true,
                      },
                    },
                  },
                },
              },
            },
          },
          where: {
            start_date: {
              lte: moment().subtract(1, "month").endOf("month").toDate(),
              gte: moment().subtract(1, "month").startOf("month").toDate(),
            },
          },
        },
        client: {
          include: {
            client_privileges: true,
          },
        },
        daycare_journals: {
          include: {
            logtime: {
              include: {
                fee: true,
              },
            },
          },
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
        const items = [],
          fees = [];

        bookings.forEach((b) => {
          const service = parseJson(b.service_data, {
            keep: ["id", "price", "category", "title", "price_unit"],
          });
          const schedules = b.schedules.filter(
            (sc) =>
              sc.clients?.length &&
              (sc.clients[0].status == ClientScheduleStatus.PRESENT ||
                sc.clients[0].status == null) &&
              sc.clients[0].client?.user_id == userId
          );
          let quantity = 0;

          if (service.category?.name == "Daycare") {
            quantity = 1;

            const logs = b.daycare_journals
              .map((dj) => dj.logtime.filter((lt) => lt.fee_id != null))
              .flat();
            if (logs.length)
              logs.forEach((l) => {
                fees.push({
                  fee_id: l.fee_id,
                  name: l.fee.title,
                  quantity: 1,
                  price: l.fee.price,
                });
              });
          } else {
            quantity = schedules.length;
          }

          const clientPrivileges = b?.client?.client_privileges || [];

          const servicePrices =
            schedules?.[schedules.length - 1]?.service?.service_prices || [];

          let usedPrivileges = null;
          const lowestPrice = servicePrices.reduce((minPrice, item) => {
            const isMatched = clientPrivileges.some(
              (clientPrivilege) =>
                clientPrivilege.privilege_id === item.privilege.id
            );

            if (isMatched && (minPrice === null || item.price < minPrice)) {
              usedPrivileges = item.privilege;
              return item.price;
            }

            return minPrice;
          }, null);

          if (quantity > 0) {
            items.push({
              start_date: schedules[0]?.start_date,
              end_date:
                schedules[schedules.length - 1]?.end_date ??
                schedules[schedules.length - 1]?.start_date,
              name: `${service.category?.name ?? ""} - ${service.title ?? ""}`,
              quantity,
              quantity_unit: service.price_unit,
              price: lowestPrice ? lowestPrice : service.price,
              service_id: service.id,
              note:
                usedPrivileges && lowestPrice
                  ? `Biaya khusus ${usedPrivileges.title}`
                  : undefined,
            });
          }
        });

        if (items.length || fees.length) {
          invoices.push({
            user_id: userId,
            title: `Tagihan layanan bulanan - ${moment().subtract(1, "month").format("MMMM YYYY")}`,
            total:
              items.reduce((a, c) => (a += c.quantity * c.price), 0) +
              fees.reduce((a, c) => (a += c.quantity * c.price), 0),
            status: InvoiceStatus.ISSUED,
            expiry_date: moment().add({ day: 3 }).endOf("day").toDate(),
            items: {
              create: items,
            },
            fees: {
              create: fees,
            },
            bookings: {
              connect: bookings.map((b) => ({ id: b.id })),
            },
          });
        }
      });

      for (const inv of invoices) {
        await db.invoice.create({ data: inv });
      }
    }

    console.log(
      `- Invoices: ${invoices.length}\n- Total: Rp ${invoices.reduce((a, c) => (a += c.total), 0)}`
    );
  } catch (err) {
    console.error(err);
  }
};

export { releaseInvoiceDaily, releaseInvoiceMonthly };
