import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";
import { BookingStatus } from "../core/booking/booking.validator.js";
import { ClientScheduleStatus } from "../core/schedule/schedule.validator.js";

/** @type {PrismaClient} */
const db = prism;

const updateBookingStatus = async () => {
  console.log(`\n\x1b[34m[CRON]\x1b[0m Update Bookings Status`);
  const current = moment();

  try {
    const bookings = await db.booking.findMany({
      where: {
        status: { in: [BookingStatus.DRAFT, BookingStatus.ONGOING] },
      },
      select: {
        id: true,
        status: true,
        quantity: true,
        schedules: {
          select: {
            status: true,
            is_blocked: true,
            schedule: { select: { start_date: true, end_date: true } },
            _count: { select: { invoices: true } },
          },
        },
      },
    });

    const toOngoing = [],
      toComplete = [];

    bookings.forEach((b) => {
      if (
        b.status == BookingStatus.DRAFT &&
        b.schedules.some(
          (sa) => !sa.is_blocked || sa._count.invoices.length > 0
        )
      )
        toOngoing.push(b.id);
      else if (
        b.status == BookingStatus.ONGOING &&
        b.schedules.filter(
          (sa) =>
            !sa.is_blocked &&
            sa.schedule &&
            moment(sa.schedule.end_date ?? sa.schedule.start_date).isBefore(
              current
            ) &&
            (sa.status == null || sa.status == ClientScheduleStatus.PRESENT)
        ).length >= b.quantity
      )
        toComplete.push(b.id);
    });

    if (toOngoing.length)
      await db.booking.updateMany({
        where: { id: { in: toOngoing } },
        data: { status: BookingStatus.ONGOING },
      });

    if (toComplete.length)
      await db.booking.updateMany({
        where: { id: { in: toComplete } },
        data: { status: BookingStatus.COMPLETED },
      });

    console.log(`- New ongoing: ${toOngoing.length}`);
    console.log(`- New completed: ${toComplete.length}`);
  } catch (err) {
    console.log(err);
  }
};

export default updateBookingStatus;
