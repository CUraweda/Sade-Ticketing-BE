import { PrismaClient } from "@prisma/client";
import { InvoiceStatus } from "../../core/invoice/invoice.validator.js";

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
                select: { attendees: { where: { is_blocked: false } } },
              },
            },
          },
        },
        where: {
          invoices: {
            every: {
              invoice: {
                id: { in: ids },
                status: InvoiceStatus.PAID,
              },
            },
          },
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
            is_blocked: false,
          },
        });

      if (getOut.length > 0)
        await db.scheduleAttendee.updateMany({
          where: { id: { in: getIn } },
          data: {
            schedule_id: null,
            is_blocked: false,
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

  return result;
};

export { extendInvoiceUpdate };
