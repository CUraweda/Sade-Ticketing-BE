import { PrismaClient } from "@prisma/client";
import { prism } from "../config/db.js";
import moment from "moment";
import { BookingStatus } from "../core/booking/booking.validator.js";

/** @type {PrismaClient} */
const db = prism;

const updateBookingComplete = async () => {
  console.log(`\n[CRON] Update Bookings Completed`);
  const now = moment();

  try {
    const bookingsOngoing = await db.booking.findMany({
      where: {
        status: BookingStatus.ONGOING,
      },
      select: {
        id: true,
        schedules: {
          select: {
            id: true,
            start_date: true,
            end_date: true,
            recurring: true,
          },
          orderBy: {
            start_date: "desc",
          },
          take: 1,
        },
      },
    });

    const bookingsComplete = bookingsOngoing.filter(
      (b) =>
        b.schedules.length &&
        moment(now).isAfter(
          b.schedules[0].end_date ?? b.schedules[0].start_date
        ) &&
        b.schedules.every((s) => s.recurring == null)
    );

    await db.booking.updateMany({
      where: {
        id: {
          in: bookingsComplete.map((b) => b.id),
        },
      },
      data: {
        status: BookingStatus.COMPLETED,
      },
    });

    console.log(
      `- Ongoing bookings: ${bookingsOngoing.length} \n- Completed bookings: ${bookingsComplete.length}`
    );
  } catch {}
};

export default updateBookingComplete;
