import { PrismaClient } from "@prisma/client";
import { InvoiceStatus } from "../../core/invoice/invoice.validator.js";
import { DaycareBookingStatus } from "../../core/daycarebooking/daycarebooking.validator.js";

/** @type {PrismaClient} */
const db = new PrismaClient();

const extendInvoiceUpdate = async ({ args, query, operation }) => {
  console.log("\n\x1b[35m[QUERY EXT]\x1b[0m Invoice Updated");

  const ids = [];
  const result = await query(args);

  if (operation == "update") ids.push(args?.where?.id);
  if (operation == "updateMany")
    args?.where?.id?.in?.forEach((id) => ids.push(id));

  try {
    if (args.data?.status == InvoiceStatus.PAID) {
      const scheduleAttendees = await db.scheduleAttendee.findMany({
        select: {
          id: true,
          schedule: {
            select: {
              max_attendees: true,
              _count: {
                select: { attendees: { where: { is_active: true } } },
              },
            },
          },
        },
        where: {
          AND: [
            { invoices: { some: {} } },
            {
              invoices: {
                every: {
                  invoice: {
                    id: { in: ids },
                    status: InvoiceStatus.PAID,
                  },
                },
              },
            },
          ],
        },
      });

      const getIn = [],
        getOut = [];
      scheduleAttendees.forEach((sa) => {
        if (sa.schedule._count.attendees >= sa.schedule.max_attendees)
          getOut.push(sa.id);
        else getIn.push(sa.id);
      });

      if (getIn.length > 0)
        await db.scheduleAttendee.updateMany({
          where: { id: { in: getIn } },
          data: {
            is_active: true,
          },
        });

      if (getOut.length > 0)
        await db.scheduleAttendee.updateMany({
          where: { id: { in: getIn } },
          data: {
            schedule_id: null,
            is_active: true,
          },
        });

      console.log(
        `- Attendees exceeding schedule max_attendees: ${getOut.length}`
      );
      console.log(
        `- Attendees fitting schedule max_attendees: ${getIn.length}`
      );
    }
  } catch (error) {
    console.log(error);
  }

  try {
    if (args.data?.status == InvoiceStatus.PAID) {
      const dcBookings = await db.daycareBooking.findMany({
        select: {
          id: true,
          status: true,
          _count: { select: { invoices: true } },
        },
        where: {
          AND: [
            { invoices: { some: {} } },
            {
              invoices: {
                some: { id: { in: ids } },
                every: { status: InvoiceStatus.PAID },
              },
            },
          ],
        },
      });
      const toOngoing = [];

      if (dcBookings.length)
        dcBookings.forEach((b) => {
          // invoice Sit In + invocie first billing
          if (b.status == DaycareBookingStatus.DRAFT && b._count.invoices == 2)
            toOngoing.push(b.id);
        });

      if (toOngoing.length)
        await db.daycareBooking.updateMany({
          where: { id: { in: toOngoing } },
          data: { status: DaycareBookingStatus.ONGOING },
        });

      console.log(`- Ongoing daycare bookings: ${toOngoing.length}`);
    }
  } catch (error) {
    console.log(error);
  }

  return result;
};

export { extendInvoiceUpdate };
